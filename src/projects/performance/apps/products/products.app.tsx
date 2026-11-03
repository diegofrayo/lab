"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import SocketStatusBadge from "../../components/socket-status-badge";
import WindowLoader from "../../desktop/components/window-loader";
import { useDesktopActions } from "../../desktop/context/desktop.hooks";
import { useDataOrchestratorSetting } from "../../hooks/use-data-orchestrator-settings.hook";
import PlainList from "./components/plain-list";
import ProductRow from "./components/product-row";
import VirtualList from "./components/virtual-list";
import { useProductsSocket } from "./hooks/use-products-socket.hook";
import type { Product } from "./utils/products-parser";

function ProductsApp(): JSX.Element {
	// --- HOOKS ---
	const { products, trends, status } = useProductsSocket();
	const { openApp } = useDesktopActions();
	const productsListMode = useDataOrchestratorSetting("productsListMode");

	// --- COMPUTED STATES ---
	const plainListEstimatedItemSize =
		productsListMode === "CONTENT_VISIBILITY" ? PRODUCT_ROW_HEIGHT : undefined;

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
		<section className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>List of Products</h1>
				<SocketStatusBadge status={status} />
			</header>
			<div className={styles.list}>
				{productsListMode === "VIRTUAL" ? (
					<VirtualList
						items={products}
						itemSize={PRODUCT_ROW_HEIGHT}
						getItemKey={getProductKey}
						renderItem={renderProduct}
					/>
				) : (
					<PlainList
						items={products}
						estimatedItemSize={plainListEstimatedItemSize}
						getItemKey={getProductKey}
						renderItem={renderProduct}
					/>
				)}
			</div>
			{status === "RECONNECTING" && <WindowLoader text="Refreshing data" />}
		</section>
	);
}

// --- STYLES ---

const styles = {
	container: cn("flex h-full flex-col gap-3"),
	header: cn("flex items-center justify-between"),
	title: cn("text-2xl font-semibold text-gray-800"),
	list: cn("min-h-0 flex-1"),
};

export default ProductsApp;

// --- CONSTANTS ---

const PRODUCT_ROW_HEIGHT = 72;

// --- UTILS ---

function getProductKey(product: Product): string {
	return product.id;
}
