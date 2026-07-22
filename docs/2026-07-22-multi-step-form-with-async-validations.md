# Multi-Step Form with Async & Conditional Validations — Implementation Plan

**Date:** 2026-07-22
**Subproject:** `/form` (`src/projects/form`)

## 1. Goal

Build a 4-step form where:

- A React context owns `formValues` and the `currentStep`, and exposes navigation/update helpers.
- Values persist to `localStorage` so progress survives a page reload.
- Each step is a self-contained file with its own `<form>` and a validation hook.
- Step 1 collects `name`, `email`, and `username`; email and username also run an async (counter-based) validation. Steps 2–4 are empty placeholders for now.

## 2. Current state (already in the repo)

These files exist and will be **reused as-is** (do not recreate):

- `components/primitive/button.tsx`, `input.tsx`, `label.tsx` — neobrutalism primitives over `@base-ui/react`.
- `components/input-error-message.tsx` — renders a red error span (null when no children).
- `hooks/use-is-hydrated.ts` — returns `false` on the server / first render, `true` after mount. Used to gate `localStorage`-driven UI and avoid hydration mismatch.
- `form.page.tsx` — currently returns `null`; this is the entry point to flesh out.
- `index.ts` — re-exports the page.

The previous context/steps/hooks/utils implementation was deleted (see `git status`), so those are green-field.

## 3. Requirements traceability

| # | Requirement | Where it's addressed |
|---|-------------|----------------------|
| 1 | Context manages `formValues` + `currentStep` | §5 |
| 2 | Exposes `updateFormValues`, `goToNextStep`, `goToPreviousStep` | §5 |
| 3 | `updateFormValues` does a **partial merge** | §5 |
| 4 | All context functions wrapped in `useCallback` | §5 |
| 5 | Provider value memoized with `useMemo` | §5 |
| 6 | Access hook named `useFormNavigation` | §6 |
| 7 | Persist input values to `localStorage` via `usehooks-ts` | §5 |
| 8 | Primitives built on `@base-ui` (`button`, `label`, `input`, `select`) | §8 |
| 9 | `react-hook-form` for per-step validation | §7 |
| 10 | New files under `src/projects/form` | §4 |
| 11 | Each step in `steps/step-<n>.tsx`, form + local validation hook | §7 |
| 12 | Step 1 has `name`, `email`, `username` | §7 |
| 13 | Steps 2–4 empty | §7 |
| 14 | Async validation for `email` + `username` (counter % 2) | §7.2 |
| 15 | zod validates the full `formValues` on final-step submit | §7.5 |

## 4. Proposed file structure

```
src/projects/form/
├── context/
│   ├── form.context.tsx        # NEW — createContext + FormProvider
│   └── form.hook.ts            # NEW — useFormNavigation()
├── components/
│   ├── primitive/
│   │   ├── button.tsx          # exists
│   │   ├── input.tsx           # exists
│   │   ├── label.tsx           # exists
│   │   └── select.tsx          # NEW (optional — see §8 / §10)
│   ├── input-error-message.tsx # exists
│   └── step-renderer.tsx       # NEW — renders the step for currentStep
├── steps/
│   ├── step-1.tsx              # NEW — name/email/username + useStep1Form
│   ├── step-2.tsx              # NEW — empty placeholder
│   ├── step-3.tsx              # NEW — empty placeholder
│   └── step-4.tsx              # NEW — empty placeholder
├── hooks/
│   └── use-is-hydrated.ts      # exists
├── utils/
│   ├── types.ts                # NEW — FormValues, StepNumber, etc.
│   ├── async-validation.ts     # NEW — counter-based validators
│   └── schema.ts               # NEW — zod schema for the full formValues
├── form.page.tsx               # edit — wire provider + step renderer
└── index.ts                    # exists
```

## 5. Context design — `context/form.context.tsx`

State:

- `formValues: Partial<FormValues>` — persisted with `useLocalStorage("form:values", {})` from `usehooks-ts`.
- `currentStep: StepNumber` (1–4) — persisted with `useLocalStorage("form:step", 1)` so a reload restores the active step too.

Exposed functions (each wrapped in `useCallback`):

- `updateFormValues(partial: Partial<FormValues>)` → `setFormValues(prev => ({ ...prev, ...partial }))`. **Partial merge**, so a step only writes its own fields.
- `goToNextStep()` → `setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS) as StepNumber)`.
- `goToPreviousStep()` → `setCurrentStep(s => Math.max(s - 1, 1) as StepNumber)`.

Because `useLocalStorage`'s setter is referentially stable, `useCallback` dependency arrays stay empty (or `[setFormValues]` / `[setCurrentStep]`), so the callbacks never change identity.

Provider value wrapped in `useMemo`:

```tsx
const value = useMemo(
  () => ({ formValues, currentStep, updateFormValues, goToNextStep, goToPreviousStep }),
  [formValues, currentStep, updateFormValues, goToNextStep, goToPreviousStep],
);
```

Context is created with `createContext<FormContextValue | null>(null)` so the hook can throw if used outside the provider.

## 6. Access hook — `context/form.hook.ts`

```ts
export function useFormNavigation(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormNavigation must be used within <FormProvider>");
  return ctx;
}
```

(`FormContext` exported from `form.context.tsx`.)

## 7. Steps

### 7.1 Pattern (all steps)

Each `steps/step-<n>.tsx` exports a default component that renders a `<form>`, and defines a `useStep<n>Form` custom hook **at the bottom of the same file**. The hook owns that step's `react-hook-form` instance and submit handler; the component just consumes it.

Submit flow: on valid submit → `updateFormValues(data)` then `goToNextStep()`. A "Back" button (hidden on step 1) calls `goToPreviousStep()`. Navigation buttons live inside each step's form so submit-gated "Next" naturally blocks advancing on invalid input.

### 7.2 Step 1 — `step-1.tsx`

Fields: `name`, `email`, `username` (all text `Input` + `Label` + `InputErrorMessage`).

`useStep1Form`:

- `useForm<Step1Values>({ mode: "onBlur", defaultValues: pick(formValues, ["name","email","username"]) })` — seed defaults from persisted context values.
- Validation via RHF `register` rules:
  - `name`: `required`, min length.
  - `email`: `required`, `pattern` (email regex), **plus** async `validate` (see below).
  - `username`: `required`, min length, **plus** async `validate`.
- Async validators come from `utils/async-validation.ts`:

  ```ts
  let counter = 0;
  export function asyncCheck(_value: string): Promise<boolean | string> {
    return new Promise((resolve) => {
      const current = counter++;
      setTimeout(() => {
        if (current % 2 === 0) resolve(true);        // even → success
        else resolve("This value is already taken"); // odd → error message
      }, 600); // simulate latency
    });
  }
  ```

  Used as `validate: asyncCheck` in the field's register options. RHF awaits async `validate` automatically; returning a string marks the field invalid with that message. (The requirement phrases it as "resolve/reject"; RHF's contract is resolve-with-`true` or resolve-with-message, which is the idiomatic equivalent — confirmed acceptable, §10.)
- While validating, `formState.isValidating` disables the "Next" button.

### 7.3 Steps 2–4 — `step-2.tsx` … `step-4.tsx`

Empty placeholders: a `<form>` with a heading ("Step N — coming soon"), Back/Next buttons wired to context navigation, and a `useStep<n>Form` stub that just calls `goToNextStep()` on submit. No fields yet.

### 7.4 `components/step-renderer.tsx`

Reads `currentStep` from `useFormNavigation()` and renders the matching step component (switch / lookup map). Keeps `form.page.tsx` thin.

### 7.5 Final-step submit — zod validation of the whole `formValues`

Per-step validation stays in `react-hook-form`. **zod** validates the *aggregate* `formValues` object once, when the user submits the last step (step 4).

- `utils/schema.ts` defines a single `formSchema = z.object({ ... })` covering every field collected across all steps (currently just step 1's `name` / `email` / `username`; extend as steps 2–4 gain fields). `FormValues` in `utils/types.ts` becomes `z.infer<typeof formSchema>` so the type and schema can't drift.
- Step 4's submit handler (`useStep4Form`) does **not** call `goToNextStep`. Instead it runs `formSchema.safeParse(formValues)`:
  - `success` → the form is complete; treat as final submission (e.g. `toast.success(...)` via `sonner`, log the payload, optionally clear the persisted `localStorage` keys).
  - `!success` → surface the aggregated issues (e.g. a `toast.error` listing which fields are invalid). This is the safety net that catches any field that slipped through — e.g. values restored from stale `localStorage` that no longer satisfy the schema.
- This adds `zod` as a dependency (`pnpm add zod`). No `@hookform/resolvers` needed, since zod is used only for the final aggregate check, not wired into a per-step RHF resolver.

## 8. Primitives — `components/primitive/`

- `button`, `input`, `label` already exist and match the required "wrap `@base-ui`" + neobrutalism conventions. Reuse them.
- `select.tsx`: **not implemented now** (§10, decision 3). Step 1 uses only text inputs and steps 2–4 are empty, so no select is needed. Add a thin `@base-ui/react/select` wrapper only when a step first requires one.

## 9. Wiring — `form.page.tsx`

```tsx
"use client";
function FormPage() {
  const isHydrated = useIsHydrated();
  if (!isHydrated) return null; // avoid localStorage hydration mismatch
  return (
    <FormProvider>
      <StepRenderer />
    </FormProvider>
  );
}
```

Guarding on `useIsHydrated` is why that hook already exists: `useLocalStorage` returns the fallback on the server, so rendering form state before hydration would mismatch.

## 10. Resolved decisions

1. **Validation split.** `react-hook-form` handles **per-step** validation. **zod** validates the aggregate `formValues` object on **final-step (step 4) submit** (§7.5). Adds `zod`; no `@hookform/resolvers` (zod isn't wired into a per-step resolver).
2. **Async "reject" semantics.** Accepted: RHF async validators resolve with `true` (valid) or a message string (invalid) rather than literally rejecting. The counter logic (`% 2 === 0` → success) is preserved.
3. **`select` primitive.** Not implemented now — only when a step needs it.
4. **Persist `currentStep`.** Yes — persisted to `localStorage` alongside `formValues`, so a reload restores the active step.

## 11. Implementation order

1. `pnpm add zod`.
2. `utils/schema.ts` — `formSchema` (zod); `utils/types.ts` — `FormValues = z.infer<typeof formSchema>`, `Step1Values`, `StepNumber`, `TOTAL_STEPS`.
3. `utils/async-validation.ts` — counter-based `asyncCheck`.
4. `context/form.context.tsx` + `context/form.hook.ts`.
5. `components/step-renderer.tsx`.
6. `steps/step-1.tsx` (full) then `step-2/3/4.tsx` (placeholders); step 4's submit runs the zod aggregate check (§7.5).
7. `form.page.tsx` wiring.
8. Verify: `pnpm build:ts`, `pnpm lint`, manual reload test (values + step persist).

## 12. Conventions to follow

- Match existing file style: `"use client"`, `forwardRef` for primitives, `~/lib/cn`, `// --- STYLES ---` / `// --- STATES & REFS ---` / `// --- EFFECTS ---` section comments, tab indentation, explicit `JSX.Element | null` return types, default-export components.
- Apply **neobrutalism** styling (per `CLAUDE.md` `/form` rule) — reuse the shadow/border patterns already in the primitives.
- Use `lucide-react` for any icons.
- Follow the project's **`react-guidelines`** skill when writing the components.
- Package manager is **pnpm** — never npm.
