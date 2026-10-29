"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import type { AppProps } from "../../desktop/desktop.types";
import OrdersTable from "./components/orders-table";
import { useProductActivitySocket } from "./hooks/use-product-activity-socket.hook";

function ProductDetailsApp({ params }: AppProps): JSX.Element {
	// --- COMPUTED STATES ---
	const { productId, productName = "" } = params;

	// --- STYLES ---
	const classes = {
		emptyState: cn("text-sm text-gray-500"),
	};

	if (productId === undefined) {
		return <p className={classes.emptyState}>Select a product to see its details.</p>;
	}

	// The key resets the orders (and the socket) when another product is opened in this window
	return (
		<ProductActivity
			key={productId}
			productId={productId}
			productName={productName}
		/>
	);
}

export default ProductDetailsApp;

// --- COMPONENTS ---

type ProductActivityProps = {
	productId: string;
	productName: string;
};

function ProductActivity({ productId, productName }: ProductActivityProps): JSX.Element {
	// --- HOOKS ---
	const { orders, isConnected } = useProductActivitySocket(productId);

	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col gap-3"),
		header: cn("flex items-center justify-between gap-3"),
		title: cn("truncate text-2xl font-semibold text-gray-800"),
		meta: cn("flex shrink-0 items-center gap-2"),
		count: cn("text-xs text-gray-500 tabular-nums"),
		status: cn(
			"rounded-full px-2 py-0.5 text-xs font-medium",
			isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
		),
		table: cn("min-h-0 flex-1"),
	};

	return (
		<section className={classes.container}>
			<header className={classes.header}>
				<h1 className={classes.title}>{productName}</h1>
				<div className={classes.meta}>
					<span className={classes.count}>{orders.length.toLocaleString("en-US")} orders</span>
					<span className={classes.status}>{isConnected ? "Live" : "Connecting…"}</span>
				</div>
			</header>
			<div className={classes.table}>
				<OrdersTable orders={orders} />
			</div>
		</section>
	);
}
