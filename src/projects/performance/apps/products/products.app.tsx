"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import { useDesktop } from "../../desktop/context/desktop.hook";
import ProductRow from "./components/product-row";
import VirtualList from "./components/virtual-list";
import { useProductsSocket } from "./hooks/use-products-socket.hook";
import type { Product } from "./utils/products-parser";

const PRODUCT_ROW_HEIGHT = 72;

function ProductsApp(): JSX.Element {
	// --- HOOKS ---
	const { products, trends, isConnected } = useProductsSocket();
	const { openApp } = useDesktop();

	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col gap-3"),
		header: cn("flex items-center justify-between"),
		title: cn("text-2xl font-semibold text-gray-800"),
		status: cn(
			"rounded-full px-2 py-0.5 text-xs font-medium",
			isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
		),
		list: cn("min-h-0 flex-1"),
	};

	// --- HANDLERS ---
	function handleProductSelect(product: Product): void {
		openApp("product-details", {
			productId: product.id,
			productName: product.name,
			productPhoto: product.photo,
		});
	}

	// --- UTILS ---
	function renderProduct(product: Product): JSX.Element {
		return (
			<ProductRow
				product={product}
				trends={trends[product.id]}
				onSelect={handleProductSelect}
			/>
		);
	}

	return (
		<section className={classes.container}>
			<header className={classes.header}>
				<h1 className={classes.title}>List of Products</h1>
				<span className={classes.status}>{isConnected ? "Live" : "Connecting…"}</span>
			</header>
			<div className={classes.list}>
				<VirtualList
					items={products}
					estimatedItemSize={PRODUCT_ROW_HEIGHT}
					getItemKey={getProductKey}
					renderItem={renderProduct}
				/>
			</div>
		</section>
	);
}

export default ProductsApp;

// --- UTILS ---

function getProductKey(product: Product): string {
	return product.id;
}
