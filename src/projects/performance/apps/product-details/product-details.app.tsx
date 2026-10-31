"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import SocketStatusBadge from "../../components/socket-status-badge";
import WindowLoader from "../../desktop/components/window-loader";
import type { AppProps } from "../../desktop/desktop.types";
import OrdersTable from "./components/orders-table";
import { useProductActivitySocket } from "./hooks/use-product-activity-socket.hook";

function ProductDetailsApp({ params, isMinimized }: AppProps<"PRODUCT_DETAILS">): JSX.Element {
	// --- COMPUTED STATES ---
	const { id: productId, name: productName } = params.product;

	// The key resets the orders (and the socket) when another product is opened in this window
	return (
		<ProductActivity
			key={productId}
			productId={productId}
			productName={productName}
			isMinimized={isMinimized}
		/>
	);
}

export default ProductDetailsApp;

// --- COMPONENTS ---

type ProductActivityProps = {
	isMinimized: boolean;
	productId: string;
	productName: string;
};

function ProductActivity({ isMinimized, productId, productName }: ProductActivityProps): JSX.Element {
	// --- HOOKS ---
	const { orders, status } = useProductActivitySocket({ productId, isPaused: isMinimized });

	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col gap-3"),
		header: cn("flex items-center justify-between gap-3"),
		title: cn("truncate text-2xl font-semibold text-gray-800"),
		meta: cn("flex shrink-0 items-center gap-2"),
		count: cn("text-xs text-gray-500 tabular-nums"),
		table: cn("min-h-0 flex-1"),
	};

	return (
		<section className={classes.container}>
			<header className={classes.header}>
				<h1 className={classes.title}>{productName}</h1>
				<div className={classes.meta}>
					<span className={classes.count}>{orders.length.toLocaleString("en-US")} orders</span>
					<SocketStatusBadge status={status} />
				</div>
			</header>
			<div className={classes.table}>
				<OrdersTable orders={orders} />
			</div>
			{status === "RECONNECTING" && <WindowLoader text="Reconnecting" />}
		</section>
	);
}
