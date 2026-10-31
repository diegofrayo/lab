# Vercel Composition Patterns report: `src/projects/performance`

- **Date:** 2026-10-31
- **Scope:** folder scan (`src/projects/performance`) against the 8 rules of the skill
- **Skill:** `vercel-composition-patterns`

Overall the code already follows the composition patterns. There is no boolean prop proliferation and no `forwardRef`, and the desktop context is already split into state and actions. What's left is two quick fixes and one optional refactor.

**Summary:** 2 fixes, 1 optional refactor and 1 minor coupling issue.

**Status:** 1 of 4 solved (#1).

## Fixes

### 1. Use the React 19 context APIs ✅

`react19-no-forwardref` (React 19 APIs)

**Where:** `desktop/context/desktop.hook.ts:13, 23` and `desktop/context/desktop.context.tsx:166-168`

- **Smell:** the hooks read the contexts with `useContext(...)`, and the provider renders `<XContext.Provider value>`.
- **Fix:** use `use(...)` instead of `useContext(...)`, and render `<XContext value>` directly.
- **Cost of the fix:** a small change with no behavior change.

### 2. Replace a render prop that passes no data

`patterns-children-over-render-props` (implementation patterns)

**Where:** `desktop/components/app-error-boundary.tsx:28-41`

- **Smell:** `ErrorBoundary` takes `renderFallback: () => ReactNode`, but the function receives no arguments.
- **Why:** the rule keeps render props for cases where the parent hands data back to the child. Without data, a node does the same job.
- **Fix:** take `fallback: ReactNode`, pass `fallback={<AppCrashed … />}` and delete `renderFallback`.
- **Not affected:** `renderItem` in `apps/products/products.app.tsx:62` is a correct use, because the list passes each item to it.

## Optional refactor

### 3. Build `Window` from compound components

`architecture-compound-components`, `architecture-avoid-boolean-props` (component architecture)

**Where:** `desktop/components/window.tsx`

- **Smell:** a single ~290-line component.
  - Two config flags decide what it shows: `hasMaximizeButton` (line 54) and `isResizable` (line 52), driven by `isMaximizable` and `isResizable` in `AppConfig`.
  - `WindowResizeHandles` gets 6 props drilled down to it: `appId`, `containerRef`, `width`, `height`, `minWidth` and `minHeight` (lines 189-196).
- **Fix:** add a `WindowContext` with:
  - **state:** the `openedApp`
  - **actions:** close, minimize, maximize, restore and focus
  - **meta:** the `containerRef`

  On top of it, build parts like `Window.Frame`, `Window.TitleBar`, `Window.MinimizeButton`, `Window.MaximizeButton`, `Window.CloseButton`, `Window.Content` and `Window.ResizeHandles`. Each part reads the context, so no props are drilled.
- **Recommendation:** with only two flags this is not yet proliferation. Windows are rendered generically from `APPS_REPOSITORY`, so keeping the flags as config is a fair design. The context would still remove the prop drilling, and it pays off if apps ever need their own window chrome (e.g. toolbar buttons in the title bar). Do it only if `Window` is expected to grow.

## Minor

### 4. One app imports a hook from another app's folder

`state-decouple-implementation` (state management)

**Where:** `apps/products/products.app.tsx:11`

- **Smell:** `ProductsApp` imports `useDataOrchestratorSettings` from inside the `data-orchestrator` app folder, so one app depends on another app's internals.
- **Fix:** the hook is just a wrapper around the shared `services/data-orchestrator.service`, so move it to a shared `hooks/` folder next to `services/`. This is about where the file lives, not the API design.

## Already matching the skill

- **State and actions in separate contexts** (`desktop/context/desktop.contexts.ts`), with the provider as the only place that knows how state is managed (`state-decouple-implementation`, `state-context-interface`).
- **Explicit variants:** `VirtualList` and `PlainList` share one API and are swapped with a single ternary, instead of one list with an `isVirtualized` flag (`patterns-explicit-variants`).
- **`children` for the app content:** `Window` and `AppErrorBoundary` take the app as `children`, not as render props.
- **Key reset instead of a mode flag:** `ProductDetailsApp` renders `ProductActivity` with `key={productId}`.
