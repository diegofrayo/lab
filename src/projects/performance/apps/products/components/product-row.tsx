import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import type { Product } from "../utils/products-parser";
import type { ProductTrends, Trend } from "../utils/products-trends";

type ProductRowProps = {
	product: Product;

	// Optional props
	trends?: ProductTrends | undefined;
};

function ProductRow({ product, trends }: ProductRowProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		container: cn("flex h-18 items-center gap-3 border-b border-gray-200 px-2"),
		photo: cn("h-12 w-12 shrink-0 rounded object-cover"),
		name: cn("flex-1 truncate text-sm font-medium text-gray-800"),
		metrics: cn("grid shrink-0 grid-cols-4 gap-3"),
	};

	return (
		<article className={classes.container}>
			<img
				className={classes.photo}
				src={product.photo}
				alt={product.name}
				loading="lazy"
			/>
			<h2 className={classes.name}>{product.name}</h2>
			<dl className={classes.metrics}>
				<ProductMetric
					label="Price"
					value={formatCurrency(product.price)}
					trend={trends?.price}
				/>
				<ProductMetric
					label="Avg. price"
					value={formatCurrency(product.averagePrice)}
					trend={trends?.averagePrice}
				/>
				<ProductMetric
					label="Avg. sales"
					value={formatNumber(product.averageSales)}
					trend={trends?.averageSales}
				/>
				<ProductMetric
					label="Total sales"
					value={formatNumber(product.totalSales)}
					trend={trends?.totalSales}
				/>
			</dl>
		</article>
	);
}

export default ProductRow;

// --- COMPONENTS ---

type ProductMetricProps = {
	label: string;
	value: string;

	// Optional props
	trend?: Trend | undefined;
};

const TREND_CLASSES: Record<Trend, string> = {
	UP: "text-green-600",
	DOWN: "text-red-600",
	EQUAL: "text-gray-800",
};

function ProductMetric({ label, value, trend = "EQUAL" }: ProductMetricProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		container: cn("flex w-20 flex-col items-end"),
		label: cn("text-[10px] text-gray-500 uppercase"),
		value: cn("text-sm font-semibold tabular-nums transition-colors", TREND_CLASSES[trend]),
	};

	return (
		<div className={classes.container}>
			<dt className={classes.label}>{label}</dt>
			<dd className={classes.value}>{value}</dd>
		</div>
	);
}

// --- UTILS ---

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function formatCurrency(value: number): string {
	return currencyFormatter.format(value);
}

function formatNumber(value: number): string {
	return numberFormatter.format(value);
}
