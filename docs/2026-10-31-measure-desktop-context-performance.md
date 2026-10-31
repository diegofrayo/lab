# Measuring the desktop context split: `src/projects/performance`

- **Date:** 2026-10-31
- **Related:** #2 of the [React Stinky report](./2026-10-31-react-stinky-performance-report.md), PR #3

How to check whether splitting `DesktopContext` into `DesktopStateContext` and `DesktopActionsContext` improves rendering performance.

## What to expect

On its own, the split barely changes the numbers.

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

This is the test that shows what the split is worth. Temporarily wrap one action-only consumer in `memo` on both branches. `DesktopIcon` is the simplest, since its `appConfig` prop never changes:

```tsx
export default memo(DesktopIcon);
```

Profile the same drag again:

- **Before the split:** `DesktopIcon` still renders on every frame, because the context value is a new object every time.
- **After the split:** `DesktopIcon` renders 0 times during the drag.

You can do the same for the window contents by memoizing the `AppComponent`. Its `params` and `isMinimized` props stay the same while another window is dragged, so this is where the large `ProductRow` list stops re-rendering.

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

Record a drag with 4× CPU throttling and compare long tasks, dropped frames and scripting time per frame. This is the user-facing measure, but it will only show a gap once the memoization from step 2 is in place.
