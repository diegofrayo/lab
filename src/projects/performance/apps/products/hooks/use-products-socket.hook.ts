"use client";

import { useEffect, useState } from "react";

import type { RawProduct } from "../../../performance.types";
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

		function handleInitialData(data: RawProduct[]): void {
			const products = parseProducts(data);
			if (!products) return;

			setProductsState({ products, trends: {} });
			setIsConnected(true);
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
		};
	}, []);

	return { ...productsState, isConnected };
}
