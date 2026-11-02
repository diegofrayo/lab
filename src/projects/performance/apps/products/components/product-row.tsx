import type { JSX } from "react";

import cn from "~/lib/cn";

import { formatCurrency } from "../../../utils/formatters";
import type { Product } from "../utils/products-parser";
import type { ProductTrends, Trend } from "../utils/products-trends";

type ProductRowProps = {
	product: Product;

	// Optional props
	trends?: ProductTrends | undefined;

	// Event handlers
	onSelect: (product: Product) => void;
};

function ProductRow({ product, trends, onSelect }: ProductRowProps): JSX.Element {
	// --- HANDLERS ---
	function handleNameClick(): void {
		onSelect(product);
	}

	return (
		<article className={productRowClasses.container}>
			<img
				className={productRowClasses.photo}
				src={product.photo}
				// Decorative: the product name is the button right next to it
				alt=""
				loading="lazy"
			/>
			<h2 className={productRowClasses.name}>
				<button
					type="button"
					className={productRowClasses.nameButton}
					onClick={handleNameClick}
				>
					{product.name}
				</button>
			</h2>
			<dl className={productRowClasses.metrics}>
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

// --- STYLES ---

const productRowClasses = {
	container: cn("relative flex h-18 items-center gap-3 border-b border-gray-200 px-2 hover:bg-gray-50"),
	photo: cn("h-12 w-12 shrink-0 rounded object-cover"),
	name: cn("min-w-0 flex-1 truncate text-sm font-medium text-gray-800"),
	// The button covers the whole row, so clicking anywhere opens the product details
	nameButton: cn(
		"cursor-pointer text-left after:absolute after:inset-0 focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-blue-500 focus-visible:after:ring-inset",
	),
	metrics: cn("grid shrink-0 grid-cols-4 gap-3"),
};

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
	const classes = getClasses({ trend });

	return (
		<div className={classes.container}>
			<dt className={classes.label}>{label}</dt>
			<dd className={classes.value}>{value}</dd>
		</div>
	);
}

// --- STYLES ---

type GetClassesParams = {
	trend: Trend;
};

function getClasses({ trend }: GetClassesParams) {
	const classes = {
		container: cn("flex w-20 flex-col items-end"),
		label: cn("text-[10px] text-gray-500 uppercase"),
		value: cn("text-sm font-semibold tabular-nums transition-colors", TREND_CLASSES[trend]),
	};

	return classes;
}

// --- UTILS ---

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function formatNumber(value: number): string {
	return numberFormatter.format(value);
}
