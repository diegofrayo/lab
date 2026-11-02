# Vercel React Best Practices report: `src/projects/performance`

- **Date:** 2026-10-31
- **Scope:** folder scan (`src/projects/performance`) against the rules of the skill, excluding `1. Eliminating Waterfalls` (`async-*`) and `3. Server-Side Performance` (`server-*`)
- **Skill:** `vercel-react-best-practices`
- **Context:** React 19.2.6, React Compiler disabled (manual memoization matters), `lucide-react` is already in Next's default `optimizePackageImports`

The desktop already follows most re-render rules: the state and actions contexts are split, the actions are stable, and drag/resize write to the DOM and commit only on drag end. What's left is mostly code splitting for the apps, moving minimized windows to `<Activity>`, and a few virtualization details.

**Summary:** 11 findings (3 bundle, 4 re-render, 2 rendering, 2 JavaScript) plus 3 small items.

**Status:** 4 of 11 solved (#1, #4, #5 and #8).

**Suggested order:** #4 → #1 → #5 → #8 / #9 → #7. #4 and #1 have the most impact. #5, #8 and #9 are small and easy to measure in the profiler.

## Bundle Size Optimization (CRITICAL)

### 1. Lazy-load the apps ✅

`bundle-dynamic-imports`, `bundle-conditional`

**Where:** `apps/index.ts:4-13`

- **Smell:** the three apps are imported statically, so `@tanstack/react-table`, `@tanstack/react-virtual` and the zod parsers are in the initial bundle, even though Product Details only opens after a click.
- **Fix:** lazy-load each app. The page is client-only (`useIsClient`), so there's no SSR cost:
  ```ts
  PRODUCT_DETAILS: lazy(() => import("./product-details/product-details.app")),
  ```
  Add a `<Suspense fallback={<WindowLoader … />}>` inside `Window`. `memo` still works because `lazy` returns a component that `memo` accepts.

### 2. Preload Product Details on hover

`bundle-preload`

**Where:** `apps/products/components/product-row.tsx:49`

- **Fix:** after #1, call `import("./product-details/product-details.app")` on `onMouseEnter` / `onFocus` of the row button, so the chunk is ready by the time the user clicks.

### 3. Avoid the barrel import in the error page

`bundle-barrel-imports`

**Where:** `performance-error.page.tsx:7`

- **Smell:** `clearOpenedApps` is imported from `./desktop`, which re-exports `Desktop` → apps → TanStack.
- **Fix:** import it from `./desktop/utils/opened-apps-storage` so the error boundary keeps a small dependency graph.

## Re-render Optimization (MEDIUM)

### 4. Use `<Activity>` for minimized windows ✅

`rendering-activity`

**Where:** `desktop/components/window.tsx:63`, `desktop/desktop.types.ts:57-58`, both socket hooks

- **Smell:** a minimized window is hidden with CSS, and each app has to pause itself by passing `isMinimized` down to `isPaused` in its socket hook.
- **Fix:** wrap the window content in `<Activity mode={isMinimized ? "hidden" : "visible"}>`. It:
  - keeps the app's state (same as now)
  - runs the effect cleanups automatically, so the sockets disconnect and reconnect on restore without any `isPaused` plumbing
  - pushes any render work in hidden windows to low priority
- **Cleanup it enables:** delete `isMinimized` from `AppProps`, along with the `if (isPaused) return` branches in `use-products-socket.hook.ts` and `use-product-activity-socket.hook.ts`.

### 5. Mark socket updates as non-urgent ✅

`rerender-transitions`, `rerender-use-deferred-value`

**Where:** `apps/products/hooks/use-products-socket.hook.ts:46`, `apps/product-details/hooks/use-product-activity-socket.hook.ts:52`

- **Smell:** at the minimum interval (100 ms), with virtualization off, every tick re-renders all rows at urgent priority and competes with dragging and typing.
- **Fix:** wrap the update-path setters (`setProductsState`, `setOrders`) in `startTransition`. Keep the initial-data setter urgent. Toggling this also makes a good lab experiment.

### 6. Subscribe to the setting that is used

`rerender-derived-state`

**Where:** `apps/products/products.app.tsx:24`

- **Smell:** `ProductsApp` only reads `isVirtualizingProducts`, but it re-renders whenever the interval or dispatch setting changes.
- **Fix:** use a selector snapshot: `useSyncExternalStore(subscribe, () => dataOrchestrator.getSettings().isVirtualizingProducts)`.

### 7. Keep untouched opened apps referentially stable

Referential stability (related: `rerender-memo`)

**Where:** `desktop/context/desktop.context.tsx:192-198`, `desktop/components/desktop.tsx:38-46`

- **Smell:** `unfocusAllApps` copies every opened app on every focus, open or restore, even apps that were already unfocused. So every `Window`, `TaskbarButton` and `WindowIcon` re-renders on each click. The apps themselves bail out thanks to `memo` and `params` keeping its reference.
- **Fix:** copy only the apps whose `isFocused` actually changes.
- **Catch:** to get real wins, `Window` would also need `memo`, and that only works if `Desktop` stops passing a fresh `children` element. Let `Window` render the `AppComponent` itself.

### 8. Stabilize the virtualizer's `getItemKey` ✅

Referential stability (TanStack Virtual)

**Where:** `apps/products/components/virtual-list.tsx:57`

- **Smell:** `getItemKey` is a dependency of TanStack Virtual's internal `getMeasurementOptions` memo (`virtual-core@3.19.8`, `dist/esm/index.js:691`). A new `getVirtualItemKey` on every render means every socket tick rebuilds the whole measurement cache.
- **Fix:** wrap it in `useCallback` with `[items, getItemKey]`. `estimateSize` can be stable too.

## Rendering Performance (MEDIUM)

### 9. Drop `measureElement` for fixed-height rows

**Where:** `apps/products/components/virtual-list.tsx:82`, `apps/product-details/components/orders-table.tsx:101`

- **Smell:** product rows are `h-18` (72px) and order rows use `ROW_HEIGHT`, yet both attach `ref={virtualizer.measureElement}`. That adds a ResizeObserver plus `getBoundingClientRect` for every mounted row.
- **Fix:** drop the ref when the size is known up front.

### 10. Add a `content-visibility` list mode to compare

`rendering-content-visibility`

**Where:** `apps/products/components/plain-list.tsx:28`

- **Fix:** for the non-virtualized mode, add `content-visibility: auto; contain-intrinsic-size: auto 72px` to each `<li>`. That gives three modes to benchmark: plain, CSS-skipped and virtualized.

## JavaScript Performance (LOW-MEDIUM)

### 11. Cap the orders list

**Where:** `apps/product-details/hooks/use-product-activity-socket.hook.ts:52`

- **Smell:** `[...newOrders, ...prev]` copies the whole array every tick, and TanStack Table rebuilds its row model over all orders. At 100 ms that's about 180k orders per hour of an open window.
- **Fix:** cap it (for example, `.slice(0, MAX_ORDERS)`), or keep unbounded growth on purpose as a stress test.

### 12. Small items

- `js-cache-function-results`: `orders.length.toLocaleString("en-US")` (`apps/product-details/product-details.app.tsx:57`) builds a formatter on every render. Reuse a module-level `Intl.NumberFormat`, as the rest of the code already does.
- `getProductTrends` (`apps/products/utils/products-trends.ts:26-33`) uses `Object.fromEntries` plus a cast for four fixed keys. An object literal is faster and needs no `as`.
- `js-request-idle-callback`: `saveOpenedApps` runs `JSON.stringify` + `setItem` on every focus click. It could be deferred to idle time, but the gain is negligible.

## Already compliant

- `rerender-lazy-state-init`: lazy `useState` init for `readOpenedApps` and the socket.
- `rerender-functional-setstate`: functional `setState` everywhere, which keeps the actions stable.
- Separate state and actions contexts.
- `rerender-use-ref-transient-values`: refs for transient drag and resize values, with a commit only on drag end.
- `advanced-event-handler-refs`: latest-callback refs in `usePointerDrag`.
- `js-cache-function-results`: module-level formatters, `Set`, and TanStack column definitions.
- `js-index-maps`: a `Map` index in `getProductsTrends`.
- `rendering-conditional-render`: `&&` is only used with booleans.
- `rerender-no-inline-components`: no components defined inside components.
- `client-localstorage-schema`: localStorage reads are validated with zod and drop bad entries.

## Not reported

- `rendering-hoist-jsx`: the `classes = { cn(...) }` objects inside components could be hoisted, but that's the project convention and the cost is tiny.
- `client-passive-event-listeners`: passive listeners only matter for touch and wheel events, not the `mousemove` used here.
