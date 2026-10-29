import type { Product } from "./products-parser";

export type Trend = "UP" | "DOWN" | "EQUAL";

export type ProductNumericField = "price" | "averagePrice" | "averageSales" | "totalSales";

export type ProductTrends = Record<ProductNumericField, Trend>;

export type ProductsTrends = Record<Product["id"], ProductTrends>;

const NUMERIC_FIELDS: ProductNumericField[] = ["price", "averagePrice", "averageSales", "totalSales"];

export function getProductsTrends(previousProducts: Product[], nextProducts: Product[]): ProductsTrends {
	const previousProductsById = new Map(previousProducts.map((product) => [product.id, product]));

	return Object.fromEntries(
		nextProducts.map((nextProduct) => {
			const previousProduct = previousProductsById.get(nextProduct.id);
			return [nextProduct.id, getProductTrends(previousProduct, nextProduct)];
		}),
	);
}

// --- UTILS ---

function getProductTrends(previousProduct: Product | undefined, nextProduct: Product): ProductTrends {
	return Object.fromEntries(
		NUMERIC_FIELDS.map((field) => [
			field,
			getTrend(previousProduct?.[field] ?? nextProduct[field], nextProduct[field]),
		]),
	) as ProductTrends;
}

function getTrend(previousValue: number, nextValue: number): Trend {
	if (nextValue > previousValue) return "UP";
	if (nextValue < previousValue) return "DOWN";
	return "EQUAL";
}
