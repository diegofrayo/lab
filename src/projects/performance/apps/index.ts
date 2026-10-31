import type { ComponentType } from "react";

import type { AppId, AppProps } from "../desktop/desktop.types";
import DataOrchestratorApp from "./data-orchestrator/data-orchestrator.app";
import ProductDetailsApp from "./product-details/product-details.app";
import ProductsApp from "./products/products.app";

export const APPS_COMPONENTS: { [TAppId in AppId]: ComponentType<AppProps<TAppId>> } = {
	PRODUCTS: ProductsApp,
	PRODUCT_DETAILS: ProductDetailsApp,
	DATA_ORCHESTRATOR: DataOrchestratorApp,
};
