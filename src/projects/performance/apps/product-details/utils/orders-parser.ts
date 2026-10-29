import { z } from "zod";

/**
 * Validates the raw socket payload and maps the ISO date string to a `Date`.
 */

const orderSchema = z
	.object({
		id: z.string().min(1),
		quantity: z.number().int().positive(),
		price: z.number(),
		total: z.number(),
		buyer: z.string(),
		date: z.iso.datetime(),
	})
	.transform((rawOrder) => ({
		...rawOrder,
		date: new Date(rawOrder.date),
	}));

export type Order = z.output<typeof orderSchema>;

/**
 * Returns `null` when the payload is not a list. Invalid orders are dropped (and logged) so a
 * single malformed item does not discard the whole message.
 */
export function parseOrders(data: unknown): Order[] | null {
	if (!Array.isArray(data)) {
		console.warn("[orders-parser] Expected a list of orders, received:", data);
		return null;
	}

	return data.flatMap((rawOrder: unknown) => {
		const result = orderSchema.safeParse(rawOrder);

		if (!result.success) {
			console.warn("[orders-parser] Invalid order dropped:", rawOrder, z.prettifyError(result.error));
			return [];
		}

		return [result.data];
	});
}
