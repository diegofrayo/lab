import type { ComponentType } from "react";

import AboutApp from "./about/about.app";
import LoginApp from "./login/login.app";
import ProductsApp from "./products/products.app";

export const APPS_COMPONENTS: Record<string, ComponentType> = {
	about: AboutApp,
	login: LoginApp,
	products: ProductsApp,
};
