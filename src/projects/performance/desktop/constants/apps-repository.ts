import type { AppsRepository } from "../desktop.types";

export const APPS_REPOSITORY: AppsRepository = {
	PRODUCTS: {
		id: "PRODUCTS",
		name: "Products",
		icon: "📦",
	},
	PRODUCT_DETAILS: {
		id: "PRODUCT_DETAILS",
		name: "Product Details",
		icon: "🧾",
		getWindowIconUrl: (params) => params.product.photo,
		getWindowTitle: (params) => params.product.name,
		getInstanceId: (params) => params.product.id,
		isHiddenFromDesktop: true,
		windowConfig: {
			x: 0,
			y: 0,
			width: 760,
			height: 480,
		},
	},
	DATA_ORCHESTRATOR: {
		id: "DATA_ORCHESTRATOR",
		name: "Data Orchestrator",
		icon: "🎛️",
		isMaximizable: false,
		isResizable: false,
		minWindowSize: {
			width: 360,
			height: 280,
		},
		windowConfig: {
			x: 0,
			y: 0,
			width: 420,
			height: 320,
		},
	},
};
