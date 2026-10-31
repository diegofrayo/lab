# React Doctor report: `src/projects/performance`

- **Date:** 2026-10-31
- **Scope:** folder scan, 47 files (`src/projects/performance`)
- **Tool:** `npx react-doctor@latest <files> --verbose --no-supply-chain`

**Score:** 83 / 100 (Needs work)

**Summary:** 7 warnings, 0 errors. 5 accessibility warnings and 2 maintainability warnings, across 2 files.

**Status:** #1 solved (the rescan reports 5 warnings, all accessibility). #2 and #3 are pending.

| #   | Rule                             | Verdict                             | Confidence |
| --- | -------------------------------- | ----------------------------------- | ---------- |
| 1   | `only-export-components` (×2)    | True positive, fix it               | High       |
| 2   | `prefer-html-dialog`             | False positive for this use case    | High       |
| 3   | `no-static-element-interactions` | True positive, the fix is a choice  | Medium     |

**Recommendation:** fix #1 now. Ignore #2 or turn off the rule for this file. Pick a fix for #3 (the simple one is recommended).

## 1. Context objects exported from the provider file ✅

`react-doctor/only-export-components` (maintainability)

**Where:** `desktop/context/desktop.context.tsx:15-16`

- **Issue:** `DesktopStateContext` and `DesktopActionsContext` are exported from the same `.tsx` file as the `DesktopProvider` component.
- **Cost:** Fast Refresh can't hot-swap a file that exports non-components. Any edit to the provider triggers a full remount instead, and the new context objects no longer match the ones the hooks are holding.
- **Fix:** move the two `createContext` calls into their own file (`desktop.contexts.ts`), along with the `DesktopState` and `DesktopActions` types. Import them in both `desktop.context.tsx` and `desktop.hook.ts`. Only `desktop.hook.ts` imports the context objects today, so the change is small and the behavior stays the same.

## 2. `role="dialog"` on a `<div>` instead of a `<dialog>`

`react-doctor/prefer-html-dialog` (accessibility)

**Where:** `desktop/components/window.tsx:141`

- **Issue:** the window is a `<div role="dialog">` instead of a native `<dialog>`.
- **Verdict:** false positive here. These are desktop-style windows that sit side by side, not modals. Their position, z-order (stacking), focus and minimize/maximize state are all handled by hand. A native `<dialog>` opened with `show()` would only add browser defaults you'd have to fight with, like centering, margins and its own focus handling.
- **Fix:** none needed. `role="dialog"` with `aria-label` is fine. Optionally turn off the rule for this file.

## 3. Mouse handlers on non-interactive elements

`react-doctor/no-static-element-interactions` (accessibility)

**Where:**

- `desktop/components/window.tsx:146`: title bar `<header onMouseDown>` (drag to move)
- `desktop/components/window.tsx:249`: right resize handle `<div onMouseDown>`
- `desktop/components/window.tsx:254`: bottom resize handle `<div onMouseDown>`
- `desktop/components/window.tsx:259`: bottom-right resize handle `<div onMouseDown>`

- **Issue:** moving and resizing a window only work with a mouse.
- **Cost:** a keyboard user can't move or resize a window. The maximize button gives them a workaround for size, but not for position.
- **Fix:** this is a design choice, so pick one:
  - **Simple (recommended):** add `aria-hidden="true"` to the resize handles and the drag area, so screen readers know they're mouse-only. Moving and resizing stay mouse-only.
  - **Complete:** make the handles focusable (`role="separator"`, `tabIndex={0}`, `aria-orientation`) and let arrow keys resize them through `resizeWindow`. You could also add arrow-key moving on the title bar. This adds a feature to the project.
