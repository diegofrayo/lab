"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import SocketStatusBadge from "../../components/socket-status-badge";
import WindowLoader from "../../desktop/components/window-loader";
import { useDesktopActions } from "../../desktop/context/desktop.hook";
import type { AppProps } from "../../desktop/desktop.types";
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
	const { openApp } = useDesktopActions();
	const { settings } = useDataOrchestratorSettings();

	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col gap-3"),
		header: cn("flex items-center justify-between"),
		title: cn("text-2xl font-semibold text-gray-800"),
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
				<SocketStatusBadge status={status} />
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
