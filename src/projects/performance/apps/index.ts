import { memo, type ComponentType } from "react";

import type { AppId, AppProps } from "../desktop/desktop.types";
import DataOrchestratorApp from "./data-orchestrator/data-orchestrator.app";
import ProductDetailsApp from "./product-details/product-details.app";
import ProductsApp from "./products/products.app";

// The apps are memoized so they don't re-render when the desktop re-renders for another window
// (e.g. on every frame of a window drag). Their props (params and isMinimized) keep the same values in that case
export const APPS_COMPONENTS: { [TAppId in AppId]: ComponentType<AppProps<TAppId>> } = {
	PRODUCTS: memo(ProductsApp),
	PRODUCT_DETAILS: memo(ProductDetailsApp),
	DATA_ORCHESTRATOR: memo(DataOrchestratorApp),
};
