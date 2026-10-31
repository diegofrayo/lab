"use client";

import { useEffect, useState } from "react";

import type { RawProductOrder, SocketStatus } from "../../../performance.types";
import { ProductActivitySocket } from "../services/product-activity-socket.service";
import { parseOrders, type Order } from "../utils/orders-parser";

type UseProductActivitySocketParams = {
	productId: string;
	// While paused, the socket is disconnected. It reconnects (and refreshes the orders) when resumed
	isPaused: boolean;
};

type UseProductActivitySocketReturn = {
	orders: Order[];
	status: SocketStatus;
};

/**
 * Consumers must remount (e.g. with `key={productId}`) to switch products, so the orders of the
 * previous product are never mixed with the new ones.
 */
export function useProductActivitySocket({
	productId,
	isPaused,
}: UseProductActivitySocketParams): UseProductActivitySocketReturn {
	const [orders, setOrders] = useState<Order[]>([]);
	const [status, setStatus] = useState<SocketStatus>("CONNECTING");
	// The same socket is reused across reconnections, so the product keeps its order prices
	const [socket] = useState(() => new ProductActivitySocket(productId));

	useEffect(
		function connectToProductActivitySocket() {
			if (isPaused) return;

			// The first message of each connection is the order history, the next ones are new orders
			let isOrderHistory = true;

			function handleOrders(data: RawProductOrder[]): void {
				const newOrders = parseOrders(data);
				if (!newOrders) return;

				if (isOrderHistory) {
					isOrderHistory = false;
					setOrders(newOrders);
					setStatus("LIVE");
					return;
				}

				// Every message is sorted newest first, so it goes on top of the previous ones
				setOrders((prev) => [...newOrders, ...prev]);
			}

			const unsubscribeOrders = socket.on("PRODUCT_DETAILS:ORDERS", handleOrders);

			socket.connect();

			return (): void => {
				unsubscribeOrders();
				socket.disconnect();
				// Only a socket that was live reconnects, one still connecting keeps that status
				setStatus((prev) => (prev === "LIVE" ? "RECONNECTING" : prev));
			};
		},
		[socket, isPaused],
	);

	return { orders, status };
}
