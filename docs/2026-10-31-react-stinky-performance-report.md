# React Stinky report: `src/projects/performance`

- **Date:** 2026-10-31
- **Scope:** folder scan, 38 files (`src/projects/performance`), including the cross-file duplication pass
- **Skill:** `react-stinky`

Overall the code is in good shape. Socket payloads are validated with zod at the boundary, every effect cleans up, keys are stable ids, `useSyncExternalStore` is used correctly, unions get exhaustive `Record<Union, …>` lookups, and `key={productId}` handles resets. What's left falls into three groups: the desktop context, accessibility gaps in the window chrome, and duplicated code between the two apps.

**Summary:** 1 rancid, 8 funky (3 of them cross-file duplication) and 5 whiffs across 13 files.

**Status:** 13 of 14 solved (#1 to #8 and the 5 whiffs). Escape handling from #3 is left out on purpose, and #9 is skipped.

The biggest wins:

1. Split the desktop context (#2). It's a performance fix as well as a cleanup.
2. Restore visible focus on the window buttons (#1).
3. Merge the two socket classes (#7).

## Rancid

### 1. Window buttons have no visible focus ✅

`focus-management` (a11y markup)

**Where:** `desktop/components/window.tsx:55-63`

- **Smell:** `btnClose`, `btnMinimize` and `btnMaximize` use `focus:outline-none` with nothing to replace it.
- **Cost:** keyboard users tabbing through a window's controls can't see which button has focus (WCAG 2.4.7).
- **Fix:** add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1`, as `ProductRow` and `DesktopIcon` already do.
- **Source:** [MDN, :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)

## Funky

### 2. Desktop context re-renders every consumer on each drag frame ✅

`context-structure` (state and data flow)

**Where:** `desktop/context/desktop.context.tsx:137-153, 174-186`

- **Smell:** one context holds both `openedApps` and the 8 action functions, and the value is a new object literal on every render. `moveWindow` and `resizeWindow` update `openedApps` on every `mousemove`.
- **Cost:** dragging *any* window re-renders every `useDesktop()` consumer about 60 times a second. That includes `apps/products/products.app.tsx:23`, which only needs `openApp`, so with virtualization off, all product rows re-render on every frame of an unrelated drag. `DesktopIcon`, `TaskbarButton` and `WindowResizeHandles` are in the same position. For a performance lab this is probably the biggest hidden cost.
- **Fix:** split the context into two:
  - `DesktopStateContext`, holding `openedApps`.
  - `DesktopActionsContext`, holding the actions. They're already `useCallback([])`, so build the actions object once (for example with `useMemo(() => ({ openApp, … }), [])`).
  - Expose `useDesktopActions()` for action-only consumers (ProductsApp, DesktopIcon, useWindowDrag, WindowResizeHandles).

  You could also keep the live drag position in a ref or CSS transform and commit `moveWindow` on `mouseup`.
- **Restructure (edges):**
  - Before: `ProductsApp → DesktopContext{openedApps, actions}` (reach-out, re-renders on drag).
  - After: `ProductsApp → DesktopActionsContext` (stable, no drag re-renders). Only `Desktop`, `Taskbar` and `Window` read state.
- **Source:** [React, Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)

### 3. Windows don't manage keyboard focus ✅

`focus-management` (a11y markup)

**Where:** `desktop/components/window.tsx:118-125`

- **Smell:** the window is a hand-rolled `role="dialog"`, but:
  - opening or focusing it doesn't move keyboard focus into it;
  - closing or minimizing it drops focus to `<body>`;
  - Escape does nothing.
- **Cost:** "focused" exists only visually. A keyboard user who opens Product Details from a row stays on the row, and the new window is unreachable until they tab through the whole desktop.
- **Fix:** you don't need a focus trap, since the windows are non-modal. Instead:
  - add `tabIndex={-1}` on the container;
  - call `containerRef.current?.focus()` when `isFocused` flips to true;
  - on close or minimize, move focus to the window's taskbar button.
- **Source:** [MDN, dialog role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)

### 4. Drag and resize repeat the same pointer-tracking logic ✅

`extract-custom-hook` (structure)

**Where:** `desktop/components/window.tsx:191-239`, `desktop/hooks/use-window-drag.hook.ts:36-95`

- **Smell:** the resize handles re-implement the drag hook's pattern: a start-snapshot ref, an "active" ref, and permanent `document` `mousemove`/`mouseup` listeners.
- **Cost:**
  - two copies of the pointer-tracking logic to keep in sync;
  - every open window keeps 4 document listeners running all the time, even when nothing is being dragged.
- **Fix:** extract a `usePointerDrag({ onMove })` that adds the listeners on start and removes them on `mouseup`. Both `useWindowDrag` and `WindowResizeHandles` then supply only their own math.
- **Source:** [React, Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

### 5. Stored apps are cast instead of validated ✅

`unsafe-assertion` (TypeScript)

**Where:** `desktop/utils/opened-apps-storage.ts:14`

- **Smell:** `JSON.parse(rawValue) as StoredOpenedApp[]` on data from localStorage. Only `appId` is checked, even though the comment at line 43 expects data from older versions.
- **Cost:** a stored entry with a missing `windowConfig`, or a `PRODUCT_DETAILS` entry without `params`, gets through. It then throws during render in `getWindowStyles` or `desktop/utils/window-title.ts:4`. The bad data is persisted, so the page crashes on every reload until storage is cleared.
- **Fix:** validate each entry with a zod schema (zod is already a dependency) and drop the invalid ones, the same way `parseProducts` does.
- **Source:** [TypeScript, type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)

### 6. No error boundary ✅

`missing-error-boundary` (async and errors)

**Where:** `desktop/components/desktop.tsx:42-45`, `src/app/performance`

- **Smell:** each `AppComponent` renders without an error boundary, and `src/app/performance` has no `error.tsx`.
- **Cost:** one app throwing (a bad payload slipping past a parser, or the storage case in #5) blanks the whole desktop.
- **Fix:** wrap each window's app in a boundary that shows "This app crashed" with a close or reload button (reset by remounting with `key`). Also add `src/app/performance/error.tsx`.
- **Source:** [React, error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Cross-file duplication

### 7. The two socket classes are the same class ✅

`duplicate-implementation` (Funky)

**Where:** `apps/products/services/products-socket.service.ts`, `apps/product-details/services/product-activity-socket.service.ts`

- **Smell:** both have the same connection counter, handler sets, and `connect`/`disconnect`/`on`/`notify`. Only the event names and data source differ.
- **Drift risk:** a fix to reconnect or notify logic lands in one socket and not the other.
- **Fix:** one generic `OrchestratorSocket<TEventName>` in `services/`, configured with `{ connectionId, dataSource, eventNames }`. The two hooks' "status + RECONNECTING on cleanup" logic could then become a shared `useSocketStatus`.

### 8. Status pill copied in both apps ✅

`duplicate-implementation` (Funky)

**Where:** `apps/products/products.app.tsx:31-34, 58`, `apps/product-details/product-details.app.tsx:49-52, 62`

- **Smell:** each copy has the same classes, the same `LIVE` color branch, and the same `SOCKET_STATUS_LABELS` lookup.
- **Fix:** create a `<SocketStatusBadge status={status} />` next to `utils/socket-status-labels.ts`.

### 9. The two parsers share the same loop

`duplicate-implementation` (Funky)

**Where:** `apps/products/utils/products-parser.ts:33-53`, `apps/product-details/utils/orders-parser.ts:27-43`

- **Smell:** `parseProducts` and `parseOrders` contain the same array-check, safeParse and drop-and-warn loop.
- **Fix:** write a single `parseList(schema, data, label)` and keep only the schemas in each file.

## Whiff ✅

- **`apps/data-orchestrator/data-orchestrator.app.tsx:89-97, 106`:** the interval input's invalid state is shown only by red text in `IntervalHint`. The input has no `aria-invalid` and no `aria-describedby` linking it to the hint. The checkbox hints at lines 76 and 118 aren't linked either. Give the hint an `id` and add `aria-describedby={hintId}` and `aria-invalid={!isIntervalValid}` to the input.
- **`apps/products/components/product-row.tsx:43`:** `alt={product.name}` sits right next to a button with the same text, so screen readers announce the name twice. Use `alt=""`, since the photo is decorative here.
- **`desktop/components/taskbar.tsx:79-83`:** `aria-label={title}` repeats the visible text, and the focused or minimized state is shown only through styling. Drop the `aria-label` and add `aria-pressed={openedApp.isFocused}`, or `aria-current` if you prefer.
- **Small helpers copied verbatim (cross-file):** `getRandomNumber`, `getRandomInteger` and `roundToCents` appear in both `utils/products-faker.ts` and `utils/orders-faker.ts`. `currencyFormatter` and `formatCurrency` appear in `apps/product-details/components/orders-table.tsx:146` and `apps/products/components/product-row.tsx:117`. Move them to `utils/random.ts` and `utils/formatters.ts`.
- **Payload shapes declared twice (cross-file):** `RawProduct` and `RawProductOrder` in `performance.types.ts` are hand-written copies of what the zod schemas accept. Derive them with `z.input<typeof productSchema>` (and the same for orders), so the contract and the validator can't drift apart.

## Not covered

- **Memoization / re-renders:** no React Compiler is configured. The inline provider value and any `useMemo`/`useCallback` decisions belong to the `react-compiler` skill, which isn't installed.
- **Color literals:** the hard-coded Tailwind colors belong to the `theme-colors` skill, which isn't installed.
