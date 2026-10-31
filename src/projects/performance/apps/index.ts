import type { ComponentType } from "react";

import type { AppProps } from "../desktop/desktop.types";
import DataOrchestratorApp from "./data-orchestrator/data-orchestrator.app";
import ProductDetailsApp from "./product-details/product-details.app";
import ProductsApp from "./products/products.app";

export const APPS_COMPONENTS: Record<string, ComponentType<AppProps>> = {
	products: ProductsApp,
	"product-details": ProductDetailsApp,
	"data-orchestrator": DataOrchestratorApp,
};
