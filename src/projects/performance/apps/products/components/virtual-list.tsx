"use client";

import { useCallback, useRef, type ReactNode } from "react";
import type { JSX } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import cn from "~/lib/cn";

/**
 * The only place that knows about TanStack Virtual. Consumers pass plain items and a render
 * function, so the virtualization library can be swapped without touching them.
 */
type VirtualListProps<TItem> = {
	// Every item must have this height. Items are not measured, so the size has to be known up front
	itemSize: number;
	items: TItem[];

	// Optional props
	overscan?: number;

	// Render functions
	getItemKey: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
};

function VirtualList<TItem>({
	itemSize,
	items,
	overscan = 5,
	getItemKey,
	renderItem,
}: VirtualListProps<TItem>): JSX.Element {
	// --- STATES & REFS ---
	const scrollElementRef = useRef<HTMLDivElement>(null);

	// --- UTILS ---
	function getScrollElement(): HTMLDivElement | null {
		return scrollElementRef.current;
	}

	// TanStack Virtual rebuilds its measurements when `estimateSize` changes, so it only changes with the size
	const getItemSize = useCallback((): number => {
		return itemSize;
	}, [itemSize]);

	// TanStack Virtual rebuilds its measurements when `getItemKey` changes, so it only changes with the items
	const getVirtualItemKey = useCallback(
		(index: number): string | number => {
			const item = items[index];
			return item === undefined ? index : getItemKey(item);
		},
		[items, getItemKey],
	);

	// --- HOOKS ---
	const virtualizer = useVirtualizer({
		count: items.length,
		overscan,
		estimateSize: getItemSize,
		getItemKey: getVirtualItemKey,
		getScrollElement,
	});

	// --- STYLES ---
	const classes = {
		scrollElement: cn("h-full overflow-auto"),
		inner: cn("relative w-full"),
		item: cn("absolute top-0 left-0 w-full"),
	};

	return (
		<div
			ref={scrollElementRef}
			className={classes.scrollElement}
		>
			<ul
				className={classes.inner}
				style={{ height: virtualizer.getTotalSize() }}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const item = items[virtualItem.index];
					if (item === undefined) return null;

					return (
						<li
							key={virtualItem.key}
							className={classes.item}
							style={{ height: itemSize, transform: `translateY(${virtualItem.start}px)` }}
						>
							{renderItem(item)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default VirtualList;
