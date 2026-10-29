import { useCallback, useEffect, useRef } from "react";

/**
 * A hook that returns a debounced version of the provided callback function.
 *
 * @param callback The function to debounce.
 * @param delay The delay in milliseconds.
 * @returns A debounced function that accepts the same arguments as the callback.
 */
export default function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
): (...args: Args) => void {
	// Store the latest callback in a ref to avoid resetting the timer on re-renders
	const callbackRef = useRef(callback);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Always keep the ref pointing to the newest callback function
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Clean up the timer if the component unmounts
	useEffect(() => {
		return (): void => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	// Return the stable, debounced version of the function
	return useCallback(
		(...args: Args) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}

			timerRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay],
	);
}
