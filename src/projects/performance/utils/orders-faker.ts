import type { RawOrder } from "../performance.types";
import type { DataSource } from "../services/data-orchestrator.service";

const BUYERS = [
	"Ada Lovelace",
	"Alan Turing",
	"Grace Hopper",
	"Linus Torvalds",
	"Margaret Hamilton",
	"Dennis Ritchie",
	"Barbara Liskov",
	"Ken Thompson",
	"Katherine Johnson",
	"Tim Berners-Lee",
	"Radia Perlman",
	"John Carmack",
];

const INITIAL_ORDERS_COUNT = 100;
const NEW_ORDERS_COUNT = 5;
const MINUTE_MS = 60 * 1000;

/**
 * Each data source keeps its own base price, so the orders of a product have consistent prices.
 * The initial data is the order history (newest first) and each update sends only the new orders.
 */
export function createOrdersDataSource(): DataSource<RawOrder[]> {
	const basePrice = getRandomNumber(10, 500);

	return {
		getInitialData: (): RawOrder[] => {
			let dateMs = Date.now();

			return Array.from({ length: INITIAL_ORDERS_COUNT }, () => {
				dateMs -= getRandomInteger(1, 5) * MINUTE_MS;
				return createOrder(basePrice, new Date(dateMs));
			});
		},
		getUpdates: (): RawOrder[] => {
			return Array.from({ length: NEW_ORDERS_COUNT }, () => createOrder(basePrice, new Date()));
		},
	};
}

// --- UTILS ---

function createOrder(basePrice: number, date: Date): RawOrder {
	const quantity = getRandomInteger(1, 10);
	const price = roundToCents(basePrice * getRandomNumber(0.95, 1.05));

	return {
		id: crypto.randomUUID(),
		quantity,
		price,
		total: roundToCents(price * quantity),
		buyer: BUYERS[getRandomInteger(0, BUYERS.length - 1)] ?? "Anonymous",
		date: date.toISOString(),
	};
}

function getRandomNumber(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function getRandomInteger(min: number, max: number): number {
	return Math.floor(getRandomNumber(min, max + 1));
}

function roundToCents(value: number): number {
	return Math.round(value * 100) / 100;
}
