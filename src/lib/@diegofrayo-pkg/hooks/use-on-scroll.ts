import { useLayoutEffect, useRef } from "react";

import type UtilsTypes from "../types";

type UseOnScrollProps = {
	onScrollCallback: () => void;
	onScrollStopCallback: () => void;
	timeout?: number;
};

function useOnScroll({
	onScrollCallback,
	onScrollStopCallback,
	timeout = 3000,
}: UseOnScrollProps): void {
	// --- STATES & REFS ---
	const isScrolling = useRef<UtilsTypes.SetTimeout | undefined>(undefined);
	const onScrollCallbackRef = useRef(onScrollCallback);
	const onScrollStopCallbackRef = useRef(onScrollStopCallback);

	// --- EFFECTS ---
	// NOTE: Keep the refs pointing to the latest callbacks without re-subscribing the scroll listener
	useLayoutEffect(() => {
		onScrollCallbackRef.current = onScrollCallback;
		onScrollStopCallbackRef.current = onScrollStopCallback;
	}, [onScrollCallback, onScrollStopCallback]);

	useLayoutEffect(() => {
		const onScroll = (): void => {
			window.clearTimeout(isScrolling.current);

			onScrollCallbackRef.current();

			isScrolling.current = setTimeout(() => {
				onScrollStopCallbackRef.current();
			}, timeout);
		};

		window.addEventListener("scroll", onScroll, false);

		return (): void => {
			window.clearTimeout(isScrolling.current);
			window.removeEventListener("scroll", onScroll, false);
		};
	}, [timeout]);
}

export default useOnScroll;
