# Measuring the desktop context split: `src/projects/performance`

- **Date:** 2026-10-31
- **Related:** #2 of the [React Stinky report](./2026-10-31-react-stinky-performance-report.md), PR #3

How to check whether splitting `DesktopContext` into `DesktopStateContext` and `DesktopActionsContext` improves rendering performance.

## What to expect

On its own, the split barely changes the numbers. Its value shows once the action-only consumers are memoized, which PR #3 also does (see step 2).

Every component that uses `useDesktopActions()` is rendered inside `Desktop` or `Taskbar`. Both of those read `openedApps`, so they re-render on every drag frame, and their children re-render with them. The split changes *why* those children re-render (from "context changed" to "parent rendered"), but not *how often*.

What the split does is make memoization possible. Before it, `memo(DesktopIcon)` did nothing, because the context value was a new object on every frame. After it, a memoized action-only consumer stops re-rendering during a drag.

## 1. React DevTools Profiler, comparing the two branches

1. Install the React DevTools extension and open the **Profiler** tab.
2. In the Profiler settings (⚙️), turn on **"Record why each component rendered while profiling"**.
3. Optionally turn on **"Highlight updates when components render"** in the General tab, so re-renders flash on screen while you drag.
4. Use the same setup on both branches: open the Products app with virtualization off and open one other window.
5. Record, drag the *other* window for about 5 seconds, then stop.
6. Compare three things:
   - the number of commits;
   - the render duration of `ProductsApp` and `ProductRow` in the ranked chart;
   - the "Why did this render?" reason on `ProductsApp`: before the split it's *"Context changed"*, after it it's *"The parent component rendered"*.

## 2. A/B test with `memo`

This is the test that shows what the split is worth. PR #3 memoizes `DesktopIcon` (`desktop/components/desktop-icon.tsx`) and every app component (`apps/index.ts`). To compare, add the same `memo` wrappers locally on `master`:

```tsx
export default memo(DesktopIcon);
```

Then profile the same drag on both branches:

- **Before the split (`master` + `memo`):** `DesktopIcon` and `ProductsApp` still render on every frame, because the context value is a new object every time and `memo` doesn't block context updates.
- **After the split (PR #3):** `DesktopIcon` renders 0 times during the drag, and neither does the app inside the window you're not dragging. That's where the large `ProductRow` list stops re-rendering.

The apps can skip renders because their props (`params` and `isMinimized`) keep the same values while another window is dragged. The `Window` components themselves still re-render.

## 3. Numbers in code with `<Profiler>`

Wrap a subtree in React's `<Profiler>` to log every render and how long it took:

```tsx
<Profiler
	id="products"
	onRender={(id, phase, actualDuration) => console.log(id, phase, actualDuration)}
>
	{/* ... */}
</Profiler>
```

Drag for a fixed time on each branch and compare the number of `onRender` calls and the total `actualDuration`.

Use a profiling production build (`next build --profile`) if you want realistic absolute timings. Dev mode inflates them, but it's fine for comparing the two branches.

## 4. Chrome Performance panel, for frame-level impact

Record a drag with 4× CPU throttling and compare long tasks, dropped frames and scripting time per frame. This is the user-facing measure, and it should show a gap between `master` and PR #3 now that the memoization from step 2 is in place.
