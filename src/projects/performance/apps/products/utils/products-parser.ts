import { z } from "zod";

/**
 * Validates the raw (snake_case) socket payload and maps it to the app's camelCase `Product`.
 */

const productSchema = z
	.object({
		id: z.string().min(1),
		name: z.string(),
		photo: z.string(),
		price: z.number(),
		average_price: z.number(),
		average_sales: z.number(),
		total_sales: z.number(),
	})
	.transform((rawProduct) => ({
		id: rawProduct.id,
		name: rawProduct.name,
		photo: rawProduct.photo,
		price: rawProduct.price,
		averagePrice: rawProduct.average_price,
		averageSales: rawProduct.average_sales,
		totalSales: rawProduct.total_sales,
	}));

// The payload the socket sends, derived from the schema so the contract and the validator can't drift apart
export type RawProduct = z.input<typeof productSchema>;

export type Product = z.output<typeof productSchema>;

/**
 * Returns `null` when the payload is not a list. Invalid products are dropped (and logged) so a
 * single malformed item does not discard the whole message.
 */
export function parseProducts(data: unknown): Product[] | null {
	if (!Array.isArray(data)) {
		console.warn("[products-parser] Expected a list of products, received:", data);
		return null;
	}

	return data.flatMap((rawProduct: unknown) => {
		const result = productSchema.safeParse(rawProduct);

		if (!result.success) {
			console.warn(
				"[products-parser] Invalid product dropped:",
				rawProduct,
				z.prettifyError(result.error),
			);
			return [];
		}

		return [result.data];
	});
}
