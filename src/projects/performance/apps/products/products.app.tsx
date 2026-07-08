import type { JSX } from "react";

import cn from "~/lib/cn";

function ProductsApp(): JSX.Element {
	// --- STYLES ---
	const classes = {
		title: cn("text-2xl font-semibold text-gray-800"),
	};

	return <h1 className={classes.title}>List of Products</h1>;
}

export default ProductsApp;
