"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent, type RefObject } from "react";

import { useDesktop } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";

type DragStart = {
	mouseX: number;
	mouseY: number;
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
	const { moveWindow } = useDesktop();
	const containerRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const dragStart = useRef<DragStart>({
		mouseX: 0,
		mouseY: 0,
		windowX: 0,
		windowY: 0,
		windowWidth: 0,
		windowHeight: 0,
		areaWidth: 0,
		areaHeight: 0,
	});

	function startDrag(e: ReactMouseEvent<HTMLElement>): void {
		// The window is positioned relative to the windows area, so that is what it is kept inside of
		const windowsArea = containerRef.current?.offsetParent;

		isDragging.current = true;
		dragStart.current = {
			mouseX: e.clientX,
			mouseY: e.clientY,
			windowX: windowConfig.x,
			windowY: windowConfig.y,
			windowWidth: windowConfig.width,
			windowHeight: windowConfig.height,
			areaWidth: windowsArea?.clientWidth ?? window.innerWidth,
			areaHeight: windowsArea?.clientHeight ?? window.innerHeight,
		};
	}

	useEffect(
		function setupDragListeners() {
			function handleMouseMove(e: MouseEvent): void {
				if (!isDragging.current) return;

				const start = dragStart.current;
				const halfWidth = start.windowWidth / 2;
				const halfHeight = start.windowHeight / 2;

				moveWindow(
					appId,
					clamp(start.windowX + e.clientX - start.mouseX, -halfWidth, start.areaWidth - halfWidth),
					clamp(start.windowY + e.clientY - start.mouseY, 0, start.areaHeight - halfHeight),
				);
			}

			function handleMouseUp(): void {
				isDragging.current = false;
			}

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return (): void => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		},
		[appId, moveWindow],
	);

	return { containerRef, startDrag };
}

// --- UTILS ---

// When the window is taller than twice the area, `max` is below `min`: `min` wins, keeping the
// title bar reachable
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}
