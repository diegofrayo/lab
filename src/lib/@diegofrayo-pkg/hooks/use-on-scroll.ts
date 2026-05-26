// TODO: Fix eslint warnings
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
	const isMounted = useRef(false);
	const isScrolling = useRef<UtilsTypes.SetTimeout | undefined>(undefined);

	// --- EFFECTS ---
	useLayoutEffect(() => {
		const onScrollStop = (): void => {
			if (!isMounted.current) return;

			onScrollStopCallback();
		};

		const onScroll = (): void => {
			window.clearTimeout(isScrolling.current);

			onScrollCallback();

			isScrolling.current = setTimeout(() => {
				onScrollStop();
			}, timeout);
		};

		isMounted.current = true;
		window.addEventListener("scroll", onScroll, false);

		return (): void => {
			isMounted.current = false;
			window.removeEventListener("scroll", onScroll, false);
		};
	}, []);
}

export default useOnScroll;
