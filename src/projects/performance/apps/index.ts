import { lazy, memo, type ComponentType } from "react";

import type { AppId, AppProps } from "../desktop/desktop.types";

// The apps are lazy-loaded, so their dependencies (e.g. TanStack Table) are only downloaded when a
// window of the app is opened. The window shows a loader while the app's chunk is downloading.
// The apps are memoized so they don't re-render when the desktop re-renders for another window
// (e.g. on every frame of a window drag). Their params keep the same reference in that case
export const APPS_COMPONENTS: { [TAppId in AppId]: ComponentType<AppProps<TAppId>> } = {
	PRODUCTS: memo(lazy(() => import("./products/products.app"))),
	PRODUCT_DETAILS: memo(lazy(() => import("./product-details/product-details.app"))),
	DATA_ORCHESTRATOR: memo(lazy(() => import("./data-orchestrator/data-orchestrator.app"))),
};
