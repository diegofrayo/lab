"use client";

import { useEffect, useState } from "react";

import type { RawProduct, SocketStatus } from "../../../performance.types";
import { ProductsSocket } from "../services/products-socket.service";
import { parseProducts, type Product } from "../utils/products-parser";
import { getProductsTrends, type ProductsTrends } from "../utils/products-trends";

type ProductsState = {
	products: Product[];
	trends: ProductsTrends;
};

type UseProductsSocketParams = {
	// While paused, the socket is disconnected. It reconnects (and refreshes the list) when resumed
	isPaused: boolean;
};

type UseProductsSocketReturn = ProductsState & {
	status: SocketStatus;
};

export function useProductsSocket({ isPaused }: UseProductsSocketParams): UseProductsSocketReturn {
	const [productsState, setProductsState] = useState<ProductsState>({ products: [], trends: {} });
	const [status, setStatus] = useState<SocketStatus>("CONNECTING");

	useEffect(
		function connectToProductsSocket() {
			if (isPaused) return;

			const socket = new ProductsSocket();

			function handleInitialData(data: RawProduct[]): void {
				const products = parseProducts(data);
				if (!products) return;

				setProductsState({ products, trends: {} });
				setStatus("LIVE");
			}

			function handleUpdates(data: RawProduct[]): void {
				const products = parseProducts(data);
				if (!products) return;

				setProductsState((prev) => ({
					products,
					trends: getProductsTrends(prev.products, products),
				}));
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
		},
		[isPaused],
	);

	return { ...productsState, status };
}
