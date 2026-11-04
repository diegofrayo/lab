"use client";

import { memo, type JSX } from "react";

import cn from "~/lib/cn";

import SocketStatusBadge from "../../components/socket-status-badge";
import WindowLoader from "../../desktop/components/window-loader";
import type { AppProps } from "../../desktop/desktop.types";
import { formatNumber } from "../../utils/formatters";
import OrdersTable from "./components/orders-table";
import { useProductActivitySocket } from "./hooks/use-product-activity-socket.hook";

function ProductDetailsApp({ params }: AppProps<"PRODUCT_DETAILS">): JSX.Element {
	// --- COMPUTED STATES ---
	const { id: productId, name: productName } = params.product;

	// The key resets the orders (and the socket) when another product is opened in this window
	return (
		<ProductActivity
			key={productId}
			productId={productId}
			productName={productName}
		/>
	);
}

export default ProductDetailsApp;

// --- COMPONENTS ---

// => ProductActivity <=

type ProductActivityProps = {
	productId: string;
	productName: string;
};

function ProductActivity({ productId, productName }: ProductActivityProps): JSX.Element {
	// --- HOOKS ---
	const { orders, status } = useProductActivitySocket({ productId });

	return (
		<section className={productActivityStyles.container}>
			<header className={productActivityStyles.header}>
				<h1 className={productActivityStyles.title}>{productName}</h1>
				<div className={productActivityStyles.meta}>
					{/* <ExpensiveText /> */}
					<MemoizedExpensiveText />
					<span className={productActivityStyles.count}>{formatNumber(orders.length)} orders</span>
					<SocketStatusBadge status={status} />
				</div>
			</header>
			<div className={productActivityStyles.table}>
				<OrdersTable orders={orders} />
			</div>
			{status === "RECONNECTING" && <WindowLoader text="Reconnecting" />}
		</section>
	);
}

const productActivityStyles = {
	container: cn("flex h-full flex-col gap-3"),
	header: cn("flex items-center justify-between gap-3"),
	title: cn("truncate text-2xl font-semibold text-gray-800"),
	meta: cn("flex shrink-0 items-center gap-2"),
	count: cn("text-xs text-gray-500 tabular-nums"),
	table: cn("min-h-0 flex-1"),
};

// => ExpensiveText <=

function ExpensiveText(): JSX.Element {
	// --- COMPUTED STATES ---
	// Upper bound for the prime search, a random integer between 1_000_000 and 2_000_000 (inclusive)
	const PRIMES_LIMIT = Math.floor(Math.random() * (2_000_000 - 1_000_000 + 1)) + 1_000_000;
	// Intentionally not memoized: the calculation runs on every render
	const primesCount = countPrimes(PRIMES_LIMIT);

	return <span className={expensiveTextStyles.text}>{formatNumber(primesCount)} primes</span>;
}

const MemoizedExpensiveText = memo(ExpensiveText);

const expensiveTextStyles = {
	text: cn("hidden text-xs text-gray-500 tabular-nums"),
};

// --- UTILS ---

// Naive trial division (no sieve) to keep the main thread busy
function countPrimes(limit: number): number {
	let count = 0;

	for (let candidate = 2; candidate <= limit; candidate += 1) {
		let isPrime = true;

		for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
			if (candidate % divisor === 0) {
				isPrime = false;
				break;
			}
		}

		if (isPrime) {
			count += 1;
		}
	}

	return count;
}
