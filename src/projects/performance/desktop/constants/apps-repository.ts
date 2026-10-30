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
};
