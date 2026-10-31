"use client";

import { useRef } from "react";
import type { JSX } from "react";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import cn from "~/lib/cn";

import type { Order } from "../utils/orders-parser";

/**
 * TanStack Table builds the rows and TanStack Virtual decides which of them are rendered. The
 * table uses CSS grid (instead of the native table layout) because the virtual rows are
 * absolutely positioned, so header and body cells share `GRID_TEMPLATE_COLUMNS` to stay aligned.
 */

type OrdersTableProps = {
	orders: Order[];
};

const ROW_HEIGHT = 36;
const GRID_TEMPLATE_COLUMNS =
	"minmax(90px, 1fr) minmax(190px, 1.5fr) minmax(140px, 1.5fr) 70px 90px 100px";

function OrdersTable({ orders }: OrdersTableProps): JSX.Element {
	// --- HOOKS ---
	const table = useTable({ features, columns, data: orders, getRowId });
	// Virtualize the table rows (not the raw orders), so future sorting/filtering is respected
	const { rows } = table.getRowModel();
	const virtualizer = useVirtualizer({
		count: rows.length,
		overscan: 10,
		estimateSize: getEstimatedRowSize,
		getItemKey: getVirtualRowKey,
		getScrollElement,
	});

	// --- STATES & REFS ---
	const scrollElementRef = useRef<HTMLDivElement>(null);

	// --- STYLES ---
	const classes = {
		scrollElement: cn("h-full overflow-auto rounded border border-gray-200"),
		table: cn("grid min-w-177 text-sm"),
		thead: cn("sticky top-0 z-10 grid bg-gray-100"),
		headerRow: cn("grid border-b border-gray-200"),
		th: cn("px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase"),
		thNumeric: cn("px-2 py-2 text-right text-xs font-semibold text-gray-600 uppercase"),
		tbody: cn("relative grid"),
		row: cn("absolute top-0 left-0 grid w-full items-center border-b border-gray-100 hover:bg-gray-50"),
		td: cn("truncate px-2 text-gray-800"),
		tdNumeric: cn("truncate px-2 text-right text-gray-800 tabular-nums"),
	};

	// --- UTILS ---
	function getVirtualRowKey(index: number): string | number {
		return rows[index]?.id ?? index;
	}

	function getScrollElement(): HTMLDivElement | null {
		return scrollElementRef.current;
	}

	return (
		<div
			ref={scrollElementRef}
			className={classes.scrollElement}
		>
			<table className={classes.table}>
				<thead className={classes.thead}>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr
							key={headerGroup.id}
							className={classes.headerRow}
							style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
						>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className={NUMERIC_COLUMNS.has(header.column.id) ? classes.thNumeric : classes.th}
								>
									{!header.isPlaceholder && <table.FlexRender header={header} />}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody
					className={classes.tbody}
					style={{ height: virtualizer.getTotalSize() }}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const row = rows[virtualRow.index];
						if (row === undefined) return null;

						return (
							<tr
								key={row.id}
								ref={virtualizer.measureElement}
								data-index={virtualRow.index}
								className={classes.row}
								style={{
									gridTemplateColumns: GRID_TEMPLATE_COLUMNS,
									height: ROW_HEIGHT,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								{row.getAllCells().map((cell) => (
									<td
										key={cell.id}
										className={NUMERIC_COLUMNS.has(cell.column.id) ? classes.tdNumeric : classes.td}
									>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default OrdersTable;

// --- CONSTANTS ---

// Stable references (module scope), so the row models are not invalidated on every render
const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Order>();
const columns = columnHelper.columns([
	columnHelper.accessor("id", { header: "Order", cell: (info) => info.getValue().slice(0, 8) }),
	columnHelper.accessor("date", { header: "Date", cell: (info) => formatDate(info.getValue()) }),
	columnHelper.accessor("buyer", { header: "Buyer" }),
	columnHelper.accessor("quantity", { header: "Qty" }),
	columnHelper.accessor("price", { header: "Price", cell: (info) => formatCurrency(info.getValue()) }),
	columnHelper.accessor("total", { header: "Total", cell: (info) => formatCurrency(info.getValue()) }),
]);

const NUMERIC_COLUMNS = new Set(["quantity", "price", "total"]);

// --- UTILS ---

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium" });

function formatCurrency(value: number): string {
	return currencyFormatter.format(value);
}

function formatDate(value: Date): string {
	return dateFormatter.format(value);
}

function getRowId(order: Order): string {
	return order.id;
}

function getEstimatedRowSize(): number {
	return ROW_HEIGHT;
}
