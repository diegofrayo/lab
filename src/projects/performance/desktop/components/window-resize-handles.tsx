"use client";

import { useRef, type JSX, type RefObject } from "react";

import cn from "~/lib/cn";

import { useDesktopActions } from "../context/desktop.hook";
import { usePointerDrag } from "../hooks/use-pointer-drag.hook";

type ResizeDirection = "RIGHT" | "BOTTOM" | "BOTTOM_RIGHT";

type ResizeStart = {
	direction: ResizeDirection;
	width: number;
	height: number;
};

type ResizeSize = {
	width: number;
	height: number;
};

type WindowResizeHandlesProps = {
	appId: string;
	containerRef: RefObject<HTMLDivElement | null>;
	width: number;
	height: number;
	minWidth: number;
	minHeight: number;
};

// While resizing, the size is kept in a ref and written straight to the window element, so the
// desktop state (and every component reading it) is updated only once, when the resize ends
function WindowResizeHandles({
	appId,
	containerRef,
	width,
	height,
	minWidth,
	minHeight,
}: WindowResizeHandlesProps): JSX.Element {
	// --- HOOKS ---
	const { focusApp, resizeWindow } = useDesktopActions();
	const resizeSizeRef = useRef<ResizeSize | null>(null);
	const { startPointerDrag } = usePointerDrag<ResizeStart>({
		onMove: ({ deltaX, deltaY, start }) => {
			const canResizeWidth = start.direction !== "BOTTOM";
			const canResizeHeight = start.direction !== "RIGHT";
			const size = {
				width: canResizeWidth ? Math.max(minWidth, start.width + deltaX) : start.width,
				height: canResizeHeight ? Math.max(minHeight, start.height + deltaY) : start.height,
			};

			resizeSizeRef.current = size;

			if (containerRef.current) {
				containerRef.current.style.width = `${size.width}px`;
				containerRef.current.style.height = `${size.height}px`;
			}
		},
		onEnd: () => {
			const size = resizeSizeRef.current;
			resizeSizeRef.current = null;

			// A click on a handle without moving the mouse doesn't change the size
			if (size) {
				resizeWindow(appId, size.width, size.height);
			}
		},
	});

	// --- HANDLERS ---
	function handleHandleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
		e.preventDefault();
		resizeSizeRef.current = null;
		startPointerDrag(e, {
			direction: e.currentTarget.dataset["direction"] as ResizeDirection,
			width,
			height,
		});
		focusApp(appId);
	}

	return (
		<>
			<div
				className={classes.right}
				data-direction="RIGHT"
				onMouseDown={handleHandleMouseDown}
			/>
			<div
				className={classes.bottom}
				data-direction="BOTTOM"
				onMouseDown={handleHandleMouseDown}
			/>
			<div
				className={classes.bottomRight}
				data-direction="BOTTOM_RIGHT"
				onMouseDown={handleHandleMouseDown}
			/>
		</>
	);
}

// --- STYLES ---

const classes = {
	right: cn("absolute top-0 right-0 bottom-3 w-1.5 cursor-ew-resize"),
	bottom: cn("absolute right-3 bottom-0 left-0 h-1.5 cursor-ns-resize"),
	bottomRight: cn("absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize"),
};

export default WindowResizeHandles;
