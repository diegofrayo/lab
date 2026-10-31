"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseWindowKeyboardFocusParams = {
	containerRef: RefObject<HTMLDivElement | null>;
	isFocused: boolean;
};

type UseWindowKeyboardFocusReturn = {
	returnFocusToOpener: () => void;
};

/**
 * Moves the keyboard focus into a window when it becomes the focused one, and saves the element
 * that opened it, so the focus can go back to that element when the window is closed.
 */
export function useWindowKeyboardFocus({
	containerRef,
	isFocused,
}: UseWindowKeyboardFocusParams): UseWindowKeyboardFocusReturn {
	const openerRef = useRef<HTMLElement | null>(null);

	// The element inside the check skips the second run of the strict mode, when the window has the focus
	useEffect(
		function saveOpenerElement() {
			const activeElement = document.activeElement;

			if (activeElement instanceof HTMLElement && !containerRef.current?.contains(activeElement)) {
				openerRef.current = activeElement;
			}
		},
		[containerRef],
	);

	useEffect(
		function moveKeyboardFocusIntoWindow() {
			const container = containerRef.current;

			if (!isFocused || !container || container.contains(document.activeElement)) return;

			container.focus({ preventScroll: true });
		},
		[isFocused, containerRef],
	);

	function returnFocusToOpener(): void {
		if (openerRef.current?.isConnected) {
			openerRef.current.focus();
		}
	}

	return { returnFocusToOpener };
}
