"use client";

import { useRef, type MouseEvent as ReactMouseEvent, type RefObject } from "react";

import { useDesktopActions } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";
import { usePointerDrag } from "./use-pointer-drag.hook";

type DragStart = {
	windowX: number;
	windowY: number;
	windowWidth: number;
	windowHeight: number;
	areaWidth: number;
	areaHeight: number;
};

type UseWindowDragParams = {
	appId: string;
	windowConfig: OpenedApp["windowConfig"];
};

type UseWindowDragReturn = {
	containerRef: RefObject<HTMLDivElement | null>;
	startDrag: (e: ReactMouseEvent<HTMLElement>) => void;
};

/**
 * Moves a window while the mouse is dragged. The top edge of the windows area is a hard limit so
 * the title bar always stays reachable. The left, right and bottom edges can be exceeded, but half
 * of the window must stay visible.
 */
export function useWindowDrag({ appId, windowConfig }: UseWindowDragParams): UseWindowDragReturn {
	const { moveWindow } = useDesktopActions();
	const containerRef = useRef<HTMLDivElement>(null);
	const { startPointerDrag } = usePointerDrag<DragStart>({
		onMove: ({ deltaX, deltaY, start }) => {
			const halfWidth = start.windowWidth / 2;
			const halfHeight = start.windowHeight / 2;

			moveWindow(
				appId,
				clamp(start.windowX + deltaX, -halfWidth, start.areaWidth - halfWidth),
				clamp(start.windowY + deltaY, 0, start.areaHeight - halfHeight),
			);
		},
	});

	function startDrag(e: ReactMouseEvent<HTMLElement>): void {
		// The window is positioned relative to the windows area, so that is what it is kept inside of
		const windowsArea = containerRef.current?.offsetParent;

		startPointerDrag(e, {
			windowX: windowConfig.x,
			windowY: windowConfig.y,
			windowWidth: windowConfig.width,
			windowHeight: windowConfig.height,
			areaWidth: windowsArea?.clientWidth ?? window.innerWidth,
			areaHeight: windowsArea?.clientHeight ?? window.innerHeight,
		});
	}

	return { containerRef, startDrag };
}

// --- UTILS ---

// When the window is taller than twice the area, `max` is below `min`: `min` wins, keeping the
// title bar reachable
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}
