# React Stinky report: `src/projects/form`

- **Date:** 2026-10-29
- **Scope:** folder scan, 28 files (`src/projects/form`)
- **Skill:** `react-stinky`

Every finding below was checked against the catalog's exceptions. One was a confirmed typo, which was verified in TanStack's type definitions.

**Summary:** 4 rancid, 12 funky (3 of them cross-file duplication) and 6 whiffs across 28 files.

**Status:** 16 of 22 solved (10 of 16 numbered findings, 6 of 6 whiffs). #10 is intentionally left open.

The highest-value fix is the step-4 submit: moving navigation into the submit handler fixes that bug and removes `useFormSubmitted`. Doing it inside a shared `useRHFStep`/`useTSFStep` hook also clears most of the duplication.

## Rancid

### 1. Final submit continues after validation fails ✅ Solved

`effect-for-derived` / `effect-for-event` (effects)

> **Solved (2026-10-29):** navigation moved into each step's submit handler via `clearPersistedInputs` + `goToNextStep`; step 4 returns early when `parseForm` fails; `hooks/use-form-submitted.ts` deleted.

**Where:** `steps/rhf/step-4.tsx:212-222`, `steps/tsf/step-4.tsx:208-218`, `hooks/use-form-submitted.ts:16`

- **Smell:** step 4's submit callback runs `parseForm` and only shows a toast when it fails. The callback never throws, so both libraries still set `isSubmitSuccessful = true`. `useFormSubmitted` watches that flag, clears the per-input storage and calls `goToNextStep()`.
- **Cost:** the user sees "Please complete all fields correctly" and lands on step 5 anyway. Their inputs have already been removed from storage.
- **Fix:** do the navigation inside the submit handler, and only when parsing succeeds. Then delete `useFormSubmitted`:

  ```ts
  onSubmit(data) {
    updateFormValues(data);
    const result = parseForm({ ...contextFormValues, ...data });
    if (!result.success) return toast.error(...);
    clearPersistedInputs(scope, FORM_INPUTS_NAME);
    goToNextStep();
  }
  ```

  Steps 1-3 get the same fix. That removes the effect and its `eslint-disable`.
- **Source:** [You Might Not Need an Effect, sending a POST request](https://react.dev/learn/you-might-not-need-an-effect#sending-a-post-request)

### 2. Yes/no question built from checkboxes ✅ Solved

`semantic-html` / `label-association` (a11y)

**Where:** `steps/rhf/step-4.tsx:97-146`, `steps/tsf/step-4.tsx:98-138`

- **Smell:** "Still studying?" is a pair of mutually exclusive checkboxes. Clicking the checked one does nothing (`if (!checked) return`). The `<Label>` "Still studying?" has no `htmlFor` and isn't linked to the group.
- **Cost:** screen readers announce two separate checkboxes with no question attached. They behave like a radio group but don't say so.
> **Solved (2026-10-29):** new `primitive/radio-group.tsx` wraps Base UI `RadioGroup` + `Radio`; both step-4 files use it, labelled by the "Still studying?" label via `aria-labelledby`.

- **Fix:** add a `primitive/radio-group.tsx` that wraps Base UI's `RadioGroup` + `Radio`, and label the group with `aria-labelledby` (or use `<fieldset>`/`<legend>`). The "can't uncheck" behaviour then comes for free.
- **Source:** [MDN, radiogroup role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role)

### 3. Error messages not linked to their fields ✅ Solved

`accessibility-props` (a11y)

**Where:** `components/form.tsx:78-107`, plus every Input/Select in the steps

- **Smell:** controls get `aria-invalid`, but `Form.FieldMessage` has no `id` and no control points at it with `aria-describedby`.
- **Cost:** a screen reader says "invalid" without giving the reason.
> **Solved (2026-10-29):** `Form.FieldMessage` takes an `inputId` and sets its own `id` from `getFieldMessageId`; every `Input`/`Select` that shows a message sets `aria-describedby` to the same id.

- **Fix:** have `Form.FieldMessage` take an `id` (e.g. `` `${name}-message` ``) and add `aria-describedby` on the control. A composite field component (see the duplication section) would make this one change instead of 19.
- **Source:** [MDN, aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby)

### 4. Loader label hard-coded to "email" ✅ Solved

`accessibility-props` (a11y)

**Where:** `components/form.tsx:166`

- **Smell:** `FieldWithLoader` always uses `aria-label="Checking email availability"`, but it also wraps the username field.
- **Cost:** on the username field, screen readers announce the wrong thing.
- **Fix:** make the label a required prop: `loadingLabel: string`.

> **Solved (2026-10-29):** `FieldWithLoader` takes a required `loadingLabel`; the email and username call sites pass their own label.
- **Source:** [MDN, aria-label](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)

## Funky

### 5. `cityOptions` held in state and synced by an effect ✅ Solved

`redundant-state` + `effect-for-derived`

**Where:** `steps/rhf/step-2.tsx:142, 151, 162-172`

- **Smell:** `cityOptions` is kept in `useState`. It's set in `handleStateChange` and again from an effect keyed on `[stateOptions]` with its deps rule disabled. Its value can be computed from `formValues.state`.
- **Cost:** two writers for one value, an extra render, and a hidden ordering dependency on `stateOptions` loading.
- **Fix:** do what the TSF version already does (`tsf/step-2.tsx:142`): `const cityOptions = formValues.state ? getCitiesOptions(formValues.state) : [];`. Then delete the state and the effect.
- **Source:** [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)

> **Solved (2026-10-29):** `cityOptions` is now computed from `formValues.state` during render, as in the TSF step. The `useState`, the `restoreCityOptions` effect and the `stateId` argument of `handleStateChange` are gone.

### 6. Re-checking `endDate` via an effect  ✅ Solved

`effect-for-event`

**Where:** `steps/rhf/step-4.tsx:242-250`

- **Smell:** an effect on `[formValues.startDate]` calls `trigger("endDate")`, with exhaustive-deps disabled.
- **Fix:** use RHF's built-in option: `startDate: { validate: ..., deps: ["endDate"] }`. This mirrors `onChangeListenTo` in the TSF version.
- **Source:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

### 7. An untyped `ValidationRules` hides a typo ✅ Solved

`loose-internal-types`

**Where:** `steps/tsf/step-1.tsx:192-206`

- **Smell:** the email field uses `onChangeAsyncDebounce: 500`. The real key is `onChangeAsyncDebounceMs` (confirmed in `@tanstack/form-core` types), which the username field spells correctly. The object has no type annotation, so passing it as a variable skips excess-property checks and the typo compiles.
- **Cost:** email only debounces because of the separate `asyncDebounceMs={500}` prop on `<form.Field>`. Remove that prop and debouncing silently stops.
- **Fix:** fix the key, and add a type so typos fail to compile: `satisfies Record<keyof Step1Values, FieldValidators<...>>`, or write the validators inline on `<form.Field>`. The RHF steps already type theirs with `RegisterOptions`.
- **Source:** [TypeScript, satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

> **Solved (2026-10-29):** the key is now `onChangeAsyncDebounceMs`, and the redundant `asyncDebounceMs={500}` prop is gone. A new `TSFValidationRules<T>` type in `utils/types.ts` is applied with `satisfies` to the `ValidationRules` of all four TSF steps, so a misspelled option now fails to compile.

### 8. `getDefaultValues` return type isn't tied to its keys ✅ Solved

`generic-props` / `unsafe-assertion`

**Where:** `context/form.context.tsx:20, 66-79`

- **Smell:** `getDefaultValues<StepFormValues = FormValues>(keys)` uses `{} as StepFormValues`, so the caller chooses the return type. `getDefaultValues<Step1Values>(["state"])` compiles.
- **Fix:** `<K extends FormInputName>(keys: K[]) => Pick<FormValues, K>`. Each step's `StepNValues` then matches its key list automatically.
- **Source:** [TypeScript, Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints)

> **Solved (2026-10-29):** `getDefaultValues` is now `<K extends FormInputName>(keys: K[]) => Pick<FormValues, K>`, so the return type comes from the keys and the caller can't choose it. Each step types its `FORM_INPUTS_NAME` as `(keyof StepNValues)[]` and calls `getDefaultValues(FORM_INPUTS_NAME)` with no explicit generic. A key that doesn't belong to the step, like `"state"` in step 1, now fails to compile.

### 9. The same values persisted in two places ✅ Solved

`duplicated-state`

**Where:** `context/form.context.tsx:41, 140-148`, `hooks/use-persist-input.ts`

- **Smell:** values live in `${scope}:form:values` (written on submit) and in `form:${scope}:input:<name>` (written on every change). `getDefaultValues` merges them with `lsValue ?? formValues[name] ?? DEFAULT`. The per-input copy is stored with `String()` and turned back into a boolean using a hand-kept `BOOLEAN_FIELD_NAMES` list. The two key formats also put the prefix in different orders (`scope:form:` vs `form:scope:`).
- **Cost:** a new boolean field restores as the string `"false"`, which is truthy, unless someone remembers to add it to the list. `resetForm` has to know about both stores, and works around it with `location.reload()`.
- **Fix:** keep one store. Either save the draft into the same `formValues` object through `updateFormValues` (debounced), or save the per-input values as JSON so types survive without a list.
- **Source:** [Choosing the State Structure, avoid duplication](https://react.dev/learn/choosing-the-state-structure#avoid-duplication-in-state)

> **Solved (2026-10-29):** took the JSON option. `usePersistInput` now stores each input with `JSON.stringify`, and `parseLocalStorageValue` reads it back with `JSON.parse` typed as `FormValues[K]`, so booleans keep their type and the `BOOLEAN_FIELD_NAMES` list is gone. The per-input key now uses the same prefix order as the other keys (`${scope}:form:input:<name>`). The draft and the submitted values are still two stores: merging them into `formValues` would make step 5 and the final `parseForm` see unsubmitted drafts.

### 10. Locations fetch has no cleanup and an unchecked cast

`missing-cleanup` + `unsafe-assertion`

**Where:** `steps/{rhf,tsf}/step-2.tsx`, `useColombiaLocations` / `fetchColombiaData`

- **Smell:** the fetch effect has no `ignore`/abort guard. If the user leaves step 2 before the fetch finishes, the unmount cleanup clears the cache and then the late response writes it back. The response isn't checked with `response.ok`, and it's cast with `as RawColombiaStateItem[]` without validation. The toast says "please try again" but there's nothing to retry with.
- **Fix:** add an `ignore` flag in cleanup, skip both `setStateOptions` and `setItem` once it's set, and parse the response with a small zod schema (zod is already a dependency). Impact here is low, which is why it's Funky and not Rancid.
- **Source:** [Synchronizing with Effects, fetching data](https://react.dev/learn/synchronizing-with-effects#fetching-data)

### 11. Primitives list their props by hand ✅ Solved

`extending-html`

**Where:** `components/primitive/checkbox.tsx:11-16`, `components/primitive/select.tsx:16-29`

- **Smell:** `Checkbox` only accepts `id`, `checked` and `onCheckedChange`. It has no `onBlur`, `name`, `disabled`, `className` or `aria-*`. So RHF's `field.onBlur` and TSF's `field.handleBlur` can't be passed, and the a11y fixes above have no prop to go through. `Select` has the same gap. `"data-state"` is required on `Input`/`Select` but optional on `Checkbox`/`Label`.
- **Fix:** extend the library's props, as `Input` already does: `type CheckboxProps = BaseCheckbox.Root.Props & { status?: FieldStatus }`. Spread `...rest` and set `data-state` inside. Renaming the prop to `status` also stops a styling hook being mistaken for an HTML attribute.
- **Source:** [React, Common components](https://react.dev/reference/react-dom/components/common)

> **Solved (2026-10-29):** `Checkbox` now takes `BaseCheckbox.Root.Props & { status? }` and spreads the rest onto the root. `Select` takes `BaseSelect.Trigger.Props` and sends `name`, `disabled`, `items`, `value` and `onValueChange` to `Select.Root`, with everything else (`id`, `aria-*`, `onBlur`, `className`) going to the trigger. Every primitive (`Input`, `Select`, `Checkbox`, `Label`, `RadioGroup`) now takes an optional `status` prop instead of `data-state`, and sets `data-state` and `aria-invalid` itself, so the steps no longer repeat `aria-invalid={status === "invalid"}`. The checkboxes now get the library's blur handler and `name`, and the selects get `name`.

### 12. `debounce` leaves superseded promises pending forever

`async-handler`

**Where:** `utils/async.ts:42-57`

- **Smell:** each call returns a new Promise. `clearTimeout` cancels the earlier timer, so those earlier promises never resolve or reject.
- **Cost:** it works now because RHF only uses the latest result. Any caller that awaits an earlier call (logging, a spinner counter) will hang.
- **Fix:** resolve superseded calls with a sentinel value, or skip the custom debounce. RHF validators can use an `AbortController`, and TSF already has `onChangeAsyncDebounceMs`.

### 13. No error boundary

`missing-error-boundary`

**Where:** app level, `src/app/**`

- **Smell:** there's no `error.tsx` anywhere.
- **Cost:** if `JSON.parse` throws on corrupted localStorage during render (e.g. in `getDefaultValues`), the whole page goes blank.
- **Fix:** add `src/app/error.tsx` with a "reset saved form" action.

## Cross-file duplication

### 14. `useColombiaLocations` copied in both step-2 files

`duplicate-implementation` (Funky)

- **Smell:** `useColombiaLocations`, `fetchColombiaData`, `readColombiaDataFromStorage`, `toStateOption`/`toCityOption` and `RawColombiaStateItem` (about 85 lines) are identical in `steps/rhf/step-2.tsx:202-288` and `steps/tsf/step-2.tsx:163-249`.
- **Risk:** the missing-cleanup fix (#10) would have to be made twice.
- **Fix:** move it to `hooks/use-colombia-locations.ts`.

### 15. Step controller boilerplate repeated in 8 hooks

`duplicate-implementation` (Funky)

- **Smell:** each `useStepNForm` hook repeats the `FORM_INPUTS_NAME` `useMemo`, the `DEFAULT_VALUES` `useMemo`, one `usePersistInput` per field, `useFormSubmitted`, and in TSF the same `preventDefault/stopPropagation/handleSubmit` wrapper four times. The `useMemo(() => [...], [])` around a constant array is really a module-level constant.
- **Fix:** add one hook per library, e.g. `useRHFStep<K>(inputNames: readonly K[])` and `useTSFStep<K>(...)`, that owns defaults, persistence and the submit-then-navigate flow. This is also the one place the Rancid submit fix (#1) would need to go.

### 16. Field status and field markup repeated

`repeated-markup` (Funky)

- **Smell:** `getFieldStatus({ isFormSubmitted, hasError: Boolean(errors.x), isTouched: Boolean(dirtyFields.x) || Boolean(touchedFields.x), hasValue: Boolean(formValues.x) })` appears 10 times in the RHF steps. The TSF version (`errors.length > 0, meta.isTouched, ...`) appears 9 times. Label + Input + FieldMessage blocks repeat about 19 times.
- **Divergence:** TSF never passes `isFormSubmitted`, so the two implementations already decide "valid" differently.
- **Fix:** add `getRHFFieldStatus(formState, values, name)` and `getTSFFieldStatus(field)`, plus a `<Form.TextField id label status message>` composite that handles the `aria-describedby` wiring (#3) once.

## Whiff

- **`context/form.hook.ts:8`:** `useFormNavigation` also returns values, scope, defaults and reset. `useFormContext` / `useMultiStepForm` would describe it better. ✅ **Solved (2026-10-29):** renamed to `useMultiStepForm` at every call site, since it exposes the whole multi-step form state, not just navigation.
- **`components/form-page.tsx:36`:** `scope` is passed to `StepRenderer` as a prop even though it's already in context. ✅ **Solved (2026-10-29):** `StepRenderer` reads `scope` from `useMultiStepForm()` and no longer takes it as a prop.
- **`utils/types.ts:25-28`:** `TOTAL_STEPS = 5` and `StepNumber = 1|2|3|4|5` can drift apart, which forces `as StepNumber` casts in the context. Derive one from the other. ✅ **Solved (2026-10-29):** a single `STEPS = [1, 2, 3, 4, 5] as const` now defines both `StepNumber` and `TOTAL_STEPS`. The context moves between steps with a `getSiblingStep` helper that indexes into `STEPS`, so the `as StepNumber` casts are gone.
- **`utils/form.ts:114-122`:** `parseForm` mutates its argument and takes `Record<string, unknown>`. It's safe today because callers pass a fresh spread, but it's a trap. Copy first and type the parameter as `Partial<FormValues>`. In `createTSFValidatorFromCustomValidation`, the generic parameter `FormValues` hides the imported `FormValues` type. ✅ **Solved (2026-10-29):** `parseForm` takes `Partial<FormValues>` and cleans a copy, so the caller's object is never mutated. The generic that hid the imported type is now called `StepValues`, in both `CustomValidation` and `createTSFValidatorFromCustomValidation`.
- **`hooks/use-form-submitted.ts`:** three positional params, one of which (`goToNextStep`) it could read from the context it already uses. This goes away with fix #1. ✅ **Solved (2026-10-29):** no code change needed. The hook was deleted by fix #1.
- **Debug output:** leftover `console.log` calls in `getDefaultValues`, `usePersistInput`, `useFormSubmitted` and `asyncCheck`. ✅ **Solved (2026-10-29):** the calls in `getDefaultValues`, `usePersistInput` and `asyncCheck` are removed; the one in `useFormSubmitted` went away with #1.

## Not covered

- **Memoization / re-renders:** `form.watch()` with no arguments (re-renders on every keystroke) and the `useCallback`/`useMemo` usage in the context belong to the `react-compiler` skill, which isn't installed.
- **Color literals:** hard-coded colors such as `#000` in the shadows belong to the `theme-colors` skill.
