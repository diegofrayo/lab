"use client";

import { startTransition, useEffect, useState } from "react";

import type { RawProduct, SocketStatus } from "../../../performance.types";
import { createProductsSocket } from "../services/products-socket.service";
import { parseProducts, type Product } from "../utils/products-parser";
import { getProductsTrends, type ProductsTrends } from "../utils/products-trends";

type ProductsState = {
	products: Product[];
	trends: ProductsTrends;
};

type UseProductsSocketReturn = ProductsState & {
	status: SocketStatus;
};

export function useProductsSocket(): UseProductsSocketReturn {
	const [productsState, setProductsState] = useState<ProductsState>({ products: [], trends: {} });
	const [status, setStatus] = useState<SocketStatus>("CONNECTING");

	useEffect(function connectToProductsSocket() {
		const socket = createProductsSocket();

		function handleInitialData(data: RawProduct[]): void {
			const products = parseProducts(data);
			if (!products) return;

			setProductsState({ products, trends: {} });
			setStatus("LIVE");
		}

		function handleUpdates(data: RawProduct[]): void {
			const products = parseProducts(data);
			if (!products) return;

			// The updates are non-urgent, so frequent ticks don't block dragging or typing
			startTransition(() => {
				setProductsState((prev) => ({
					products,
					trends: getProductsTrends(prev.products, products),
				}));
			});
		}

		const unsubscribeInitialData = socket.on("PRODUCTS:INITIAL_LIST", handleInitialData);
		const unsubscribeUpdates = socket.on("PRODUCTS:LIST_UPDATES", handleUpdates);

		socket.connect();

		return (): void => {
			unsubscribeInitialData();
			unsubscribeUpdates();
			socket.disconnect();
			// Only a socket that was live reconnects, one still connecting keeps that status
			setStatus((prev) => (prev === "LIVE" ? "RECONNECTING" : prev));
		};
	}, []);

	return { ...productsState, status };
}
