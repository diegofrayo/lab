import type { AppsRepository } from "../desktop.types";

export const APPS_REPOSITORY: AppsRepository = {
	products: {
		id: "products",
		name: "Products",
		icon: "📦",
	},
	"product-details": {
		id: "product-details",
		name: "Product Details",
		icon: "🧾",
		getWindowIconUrl: (params) => params["productPhoto"],
		getWindowTitle: (params) => params["productName"],
		isHiddenFromDesktop: true,
		allowMultipleInstances: true,
		windowConfig: {
			x: 0,
			y: 0,
			width: 760,
			height: 480,
		},
	},
	"data-orchestrator": {
		id: "data-orchestrator",
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
