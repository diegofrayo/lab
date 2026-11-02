import type { CSSProperties, JSX, ReactNode } from "react";

import cn from "~/lib/cn";

/**
 * Renders all the items at once. It has the same API as `VirtualList`, so both can be swapped to
 * compare their performance.
 */

type PlainListProps<TItem> = {
	items: TItem[];
	// When set, the browser skips the layout and paint of the off-screen items
	// (`content-visibility: auto`), using this size as their placeholder height
	estimatedItemSize?: number | undefined;

	// Render functions
	getItemKey: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
};

function PlainList<TItem>({
	items,
	estimatedItemSize,
	getItemKey,
	renderItem,
}: PlainListProps<TItem>): JSX.Element {
	// --- COMPUTED STATES ---
	const isSkippingOffscreenItems = estimatedItemSize !== undefined;
	const itemStyle: CSSProperties | undefined = isSkippingOffscreenItems
		? { containIntrinsicSize: `auto ${estimatedItemSize}px` }
		: undefined;

	return (
		<div className={styles.scrollElement}>
			<ul>
				{items.map((item) => (
					<li
						key={getItemKey(item)}
						className={isSkippingOffscreenItems ? styles.offscreenSkippableItem : undefined}
						style={itemStyle}
					>
						{renderItem(item)}
					</li>
				))}
			</ul>
		</div>
	);
}

// --- STYLES ---

const styles = {
	scrollElement: cn("h-full overflow-auto"),
	offscreenSkippableItem: cn("[content-visibility:auto]"),
};

export default PlainList;
