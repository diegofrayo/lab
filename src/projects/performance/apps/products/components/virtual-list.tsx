"use client";

import { useRef, type ReactNode } from "react";
import type { JSX } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import cn from "~/lib/cn";

/**
 * The only place that knows about TanStack Virtual. Consumers pass plain items and a render
 * function, so the virtualization library can be swapped without touching them.
 */

type VirtualListProps<TItem> = {
	estimatedItemSize: number;
	items: TItem[];

	// Optional props
	overscan?: number;

	// Render functions
	getItemKey: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
};

function VirtualList<TItem>({
	estimatedItemSize,
	items,
	overscan = 5,
	getItemKey,
	renderItem,
}: VirtualListProps<TItem>): JSX.Element {
	// --- STATES & REFS ---
	const scrollElementRef = useRef<HTMLDivElement>(null);

	// --- HOOKS ---
	const virtualizer = useVirtualizer({
		count: items.length,
		overscan,
		estimateSize: getEstimatedItemSize,
		getItemKey: getVirtualItemKey,
		getScrollElement,
	});

	// --- STYLES ---
	const classes = {
		scrollElement: cn("h-full overflow-auto"),
		inner: cn("relative w-full"),
		item: cn("absolute top-0 left-0 w-full"),
	};

	// --- UTILS ---
	function getEstimatedItemSize(): number {
		return estimatedItemSize;
	}

	function getVirtualItemKey(index: number): string | number {
		const item = items[index];
		return item === undefined ? index : getItemKey(item);
	}

	function getScrollElement(): HTMLDivElement | null {
		return scrollElementRef.current;
	}

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
							ref={virtualizer.measureElement}
							data-index={virtualItem.index}
							className={classes.item}
							style={{ transform: `translateY(${virtualItem.start}px)` }}
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
