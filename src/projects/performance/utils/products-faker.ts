import type { RawProduct } from "../performance.types";
import { getRandomInteger, getRandomNumber, roundToCents } from "./random";

const PRODUCT_NAMES = [
	"Wireless Headphones",
	"Mechanical Keyboard",
	"Ergonomic Mouse",
	"4K Monitor",
	"USB-C Hub",
	"Laptop Stand",
	"Webcam HD",
	"Desk Lamp",
	"Bluetooth Speaker",
	"Portable SSD",
	"Smartwatch",
	"Fitness Tracker",
	"Noise Cancelling Earbuds",
	"Gaming Chair",
	"Standing Desk",
	"Microphone Kit",
	"Graphics Tablet",
	"Power Bank",
	"Smart Plug",
	"Action Camera",
];

export function createProducts(): RawProduct[] {
	return PRODUCT_NAMES.map((name, index) => {
		const id = `product-${index + 1}`;
		const price = roundToCents(getRandomNumber(10, 500));
		const averageSales = getRandomInteger(5, 50);

		return {
			id,
			name,
			photo: `https://picsum.photos/seed/${id}/96`,
			price,
			average_price: roundToCents(price * getRandomNumber(0.9, 1.1)),
			average_sales: averageSales,
			total_sales: averageSales * getRandomInteger(50, 200),
		};
	});
}

export function updateProducts(products: RawProduct[]): RawProduct[] {
	return products.map((product) => {
		const price = roundToCents(product.price * getRandomNumber(0.95, 1.05));
		const newSales = getRandomInteger(0, 20);

		return {
			...product,
			price,
			average_price: roundToCents(product.average_price * 0.9 + price * 0.1),
			average_sales: roundToCents(product.average_sales * 0.9 + newSales * 0.1),
			total_sales: product.total_sales + newSales,
		};
	});
}
