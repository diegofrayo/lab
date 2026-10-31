"use client";

import { useEffect, useState } from "react";

import type { RawProductOrder } from "../../../performance.types";
import { ProductActivitySocket } from "../services/product-activity-socket.service";
import { parseOrders, type Order } from "../utils/orders-parser";

type UseProductActivitySocketReturn = {
	orders: Order[];
	isConnected: boolean;
};

/**
 * Consumers must remount (e.g. with `key={productId}`) to switch products, so the orders of the
 * previous product are never mixed with the new ones.
 */
export function useProductActivitySocket(productId: string): UseProductActivitySocketReturn {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(
		function connectToProductActivitySocket() {
			const socket = new ProductActivitySocket(productId);

			function handleOrders(data: RawProductOrder[]): void {
				const newOrders = parseOrders(data);
				if (!newOrders) return;

				// Every message is sorted newest first, so it goes on top of the previous ones
				setOrders((prev) => [...newOrders, ...prev]);
				setIsConnected(true);
			}

			const unsubscribeOrders = socket.on("PRODUCT_DETAILS:ORDERS", handleOrders);

			socket.connect();

			return (): void => {
				unsubscribeOrders();
				socket.disconnect();
			};
		},
		[productId],
	);

	return { orders, isConnected };
}
