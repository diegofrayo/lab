"use client";

import { useEffect, useState } from "react";

import { ProductsSocket } from "../services/products-socket.service";
import { parseProducts, type Product } from "../utils/products-parser";
import { getProductsTrends, type ProductsTrends } from "../utils/products-trends";

type ProductsState = {
	products: Product[];
	trends: ProductsTrends;
};

type UseProductsSocketReturn = ProductsState & {
	isConnected: boolean;
};

export function useProductsSocket(): UseProductsSocketReturn {
	const [productsState, setProductsState] = useState<ProductsState>({ products: [], trends: {} });
	const [isConnected, setIsConnected] = useState(false);

	useEffect(function connectToProductsSocket() {
		const socket = new ProductsSocket();

		function handleInitialData(data: unknown): void {
			const products = parseProducts(data);
			if (!products) return;

			setProductsState({ products, trends: {} });
			setIsConnected(true);
		}

		function handleUpdates(data: unknown): void {
			const products = parseProducts(data);
			if (!products) return;

			setProductsState((prev) => ({
				products,
				trends: getProductsTrends(prev.products, products),
			}));
		}

		const unsubscribeInitialData = socket.on("FETCH_INITIAL_DATA", handleInitialData);
		const unsubscribeUpdates = socket.on("GET_UPDATES", handleUpdates);

		socket.connect();

		return (): void => {
			unsubscribeInitialData();
			unsubscribeUpdates();
			socket.disconnect();
		};
	}, []);

	return { ...productsState, isConnected };
}
