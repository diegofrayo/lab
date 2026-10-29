import type { ComponentType } from "react";

import ProductsApp from "./products/products.app";

export const APPS_COMPONENTS: Record<string, ComponentType> = {
	products: ProductsApp,
};
