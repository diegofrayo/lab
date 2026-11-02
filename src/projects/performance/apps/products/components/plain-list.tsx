import type { JSX, ReactNode } from "react";

import cn from "~/lib/cn";

/**
 * Renders all the items at once. It has the same API as `VirtualList`, so both can be swapped to
 * compare their performance.
 */

type PlainListProps<TItem> = {
	items: TItem[];

	// Render functions
	getItemKey: (item: TItem) => string;
	renderItem: (item: TItem) => ReactNode;
};

function PlainList<TItem>({ items, getItemKey, renderItem }: PlainListProps<TItem>): JSX.Element {
	return (
		<div className={styles.scrollElement}>
			<ul>
				{items.map((item) => (
					<li key={getItemKey(item)}>{renderItem(item)}</li>
				))}
			</ul>
		</div>
	);
}

// --- STYLES ---

const styles = {
	scrollElement: cn("h-full overflow-auto"),
};

export default PlainList;
