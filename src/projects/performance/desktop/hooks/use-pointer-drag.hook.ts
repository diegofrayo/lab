"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

type PointerDragMove<TStart> = {
	deltaX: number;
	deltaY: number;
	start: TStart;
};

type UsePointerDragParams<TStart> = {
	onMove: (move: PointerDragMove<TStart>) => void;
	// Called on `mouseup`, not when the drag is cut short by an unmount
	onEnd?: () => void;
};

type UsePointerDragReturn<TStart> = {
	startPointerDrag: (e: ReactMouseEvent<HTMLElement>, start: TStart) => void;
};

/**
 * Tracks the mouse from a `mousedown` until the next `mouseup`. The document listeners only exist
 * while dragging. `start` is a snapshot taken when the drag starts, and it is passed back on each
 * move together with the distance from the starting point.
 */
export function usePointerDrag<TStart>({
	onMove,
	onEnd,
}: UsePointerDragParams<TStart>): UsePointerDragReturn<TStart> {
	const onMoveRef = useRef(onMove);
	const onEndRef = useRef(onEnd);
	const stopDragRef = useRef<(() => void) | null>(null);

	useEffect(function updateCallbackRefs() {
		onMoveRef.current = onMove;
		onEndRef.current = onEnd;
	});

	useEffect(function stopDragOnUnmount() {
		return (): void => {
			stopDragRef.current?.();
		};
	}, []);

	function startPointerDrag(e: ReactMouseEvent<HTMLElement>, start: TStart): void {
		stopDragRef.current?.();

		const mouseX = e.clientX;
		const mouseY = e.clientY;

		function handleMouseMove(moveEvent: MouseEvent): void {
			onMoveRef.current({
				deltaX: moveEvent.clientX - mouseX,
				deltaY: moveEvent.clientY - mouseY,
				start,
			});
		}

		function handleMouseUp(): void {
			stopDrag();
			onEndRef.current?.();
		}

		function stopDrag(): void {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			stopDragRef.current = null;
		}

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		stopDragRef.current = stopDrag;
	}

	return { startPointerDrag };
}
