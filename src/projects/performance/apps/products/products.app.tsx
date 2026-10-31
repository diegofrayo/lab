"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import WindowLoader from "../../desktop/components/window-loader";
import { useDesktop } from "../../desktop/context/desktop.hook";
import type { AppProps } from "../../desktop/desktop.types";
import { SOCKET_STATUS_LABELS } from "../../utils/socket-status-labels";
import { useDataOrchestratorSettings } from "../data-orchestrator/hooks/use-data-orchestrator-settings.hook";
import PlainList from "./components/plain-list";
import ProductRow from "./components/product-row";
import VirtualList from "./components/virtual-list";
import { useProductsSocket } from "./hooks/use-products-socket.hook";
import type { Product } from "./utils/products-parser";

const PRODUCT_ROW_HEIGHT = 72;

function ProductsApp({ isMinimized }: AppProps): JSX.Element {
	// --- HOOKS ---
	const { products, trends, status } = useProductsSocket({ isPaused: isMinimized });
	const { openApp } = useDesktop();
	const { settings } = useDataOrchestratorSettings();

	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col gap-3"),
		header: cn("flex items-center justify-between"),
		title: cn("text-2xl font-semibold text-gray-800"),
		status: cn(
			"rounded-full px-2 py-0.5 text-xs font-medium",
			status === "LIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
		),
		list: cn("min-h-0 flex-1"),
	};

	// --- HANDLERS ---
	function handleProductSelect(product: Product): void {
		openApp({ appId: "PRODUCT_DETAILS", params: { product } });
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
				<span className={classes.status}>{SOCKET_STATUS_LABELS[status]}</span>
			</header>
			<div className={classes.list}>
				{settings.isVirtualizingProducts ? (
					<VirtualList
						items={products}
						estimatedItemSize={PRODUCT_ROW_HEIGHT}
						getItemKey={getProductKey}
						renderItem={renderProduct}
					/>
				) : (
					<PlainList
						items={products}
						getItemKey={getProductKey}
						renderItem={renderProduct}
					/>
				)}
			</div>
			{status === "RECONNECTING" && <WindowLoader text="Refreshing data" />}
		</section>
	);
}

export default ProductsApp;

// --- UTILS ---

function getProductKey(product: Product): string {
	return product.id;
}
