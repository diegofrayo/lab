"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { CSSProperties, JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import { useDesktop } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";
import { useWindowDrag } from "../hooks/use-window-drag.hook";
import { getMinWindowSize } from "../utils/window-size";
import { getWindowTitle } from "../utils/window-title";
import WindowIcon from "./window-icon";

type ResizeDirection = "RIGHT" | "BOTTOM" | "BOTTOM_RIGHT";

type WindowProps = {
	openedApp: OpenedApp;
	children: ReactNode;
};

function Window({ openedApp, children }: WindowProps): JSX.Element {
	// --- HOOKS ---
	const { closeApp, minimizeApp, maximizeApp, restoreApp, focusApp } = useDesktop();
	const { containerRef, startDrag } = useWindowDrag({
		appId: openedApp.id,
		windowConfig: openedApp.windowConfig,
	});

	// --- COMPUTED STATES ---
	const { id, appConfig, windowConfig, isFocused, status } = openedApp;
	const isMaximized = status === "MAXIMIZED";
	const isMinimized = status === "MINIMIZED";
	const isResizable = (appConfig.isResizable ?? true) && !isMaximized;
	// A window restored as maximized (e.g. from the local storage) keeps the button to restore it
	const hasMaximizeButton = (appConfig.isMaximizable ?? true) || isMaximized;
	const minWindowSize = getMinWindowSize(appConfig);
	const title = getWindowTitle(openedApp);

	// --- STYLES ---
	const classes = {
		container: cn(
			"pointer-events-auto absolute flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl transition-shadow",
			isFocused ? "z-50 shadow-black/30" : "z-10 shadow-black/10",
			isMinimized ? "hidden" : "flex",
		),
		titleBar: cn(
			"flex items-center justify-between px-3 py-2 select-none",
			isFocused ? "bg-gray-200" : "bg-gray-100",
			isMaximized ? "cursor-default" : "cursor-grab",
		),
		titleInfo: cn("flex min-w-0 items-center gap-2 text-sm font-medium text-gray-700"),
		title: cn("truncate"),
		titleButtons: cn("flex items-center gap-1.5"),
		btnClose: cn(
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600 focus:outline-none",
		),
		btnMinimize: cn(
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 focus:outline-none",
		),
		btnMaximize: cn(
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-green-500 hover:bg-green-600 focus:outline-none",
		),
		content: cn("relative flex-1 overflow-auto bg-white p-4"),
	};

	// --- HANDLERS ---
	function handleTitleBarMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
		startDrag(e);
		focusApp(id);
	}

	function handleContainerMouseDown(): void {
		focusApp(id);
	}

	function handleCloseClick(e: React.MouseEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		closeApp(id);
	}

	function handleMinimizeClick(e: React.MouseEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		minimizeApp(id);
	}

	function handleMaximizeClick(e: React.MouseEvent<HTMLButtonElement>): void {
		e.stopPropagation();

		if (isMaximized) {
			restoreApp(id);
		} else {
			maximizeApp(id);
		}
	}

	// --- UTILS ---
	function getWindowStyles(): CSSProperties {
		if (isMaximized) {
			return {
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
			};
		}

		return {
			left: windowConfig.x,
			top: windowConfig.y,
			width: windowConfig.width,
			height: windowConfig.height,
		};
	}

	// A minimized window is hidden instead of unmounted, so its app keeps its state
	return (
		<div
			ref={containerRef}
			className={classes.container}
			style={getWindowStyles()}
			role="dialog"
			aria-label={title}
			onMouseDown={handleContainerMouseDown}
		>
			<header
				className={classes.titleBar}
				onMouseDown={handleTitleBarMouseDown}
			>
				<div className={classes.titleInfo}>
					<WindowIcon openedApp={openedApp} />
					<span className={classes.title}>{title}</span>
				</div>
				<div className={classes.titleButtons}>
					<button
						className={classes.btnMinimize}
						onClick={handleMinimizeClick}
						aria-label="Minimize"
					/>
					{hasMaximizeButton && (
						<button
							className={classes.btnMaximize}
							onClick={handleMaximizeClick}
							aria-label={isMaximized ? "Restore" : "Maximize"}
						/>
					)}
					<button
						className={classes.btnClose}
						onClick={handleCloseClick}
						aria-label="Close"
					/>
				</div>
			</header>
			<section className={classes.content}>{children}</section>
			{isResizable ? (
				<WindowResizeHandles
					appId={id}
					width={windowConfig.width}
					height={windowConfig.height}
					minWidth={minWindowSize.width}
					minHeight={minWindowSize.height}
				/>
			) : null}
		</div>
	);
}

export default Window;

// --- COMPONENTS ---

type WindowResizeHandlesProps = {
	appId: string;
	width: number;
	height: number;
	minWidth: number;
	minHeight: number;
};

function WindowResizeHandles({
	appId,
	width,
	height,
	minWidth,
	minHeight,
}: WindowResizeHandlesProps): JSX.Element {
	// --- HOOKS ---
	const { focusApp, resizeWindow } = useDesktop();

	// --- STATES & REFS ---
	const resizeDirection = useRef<ResizeDirection | null>(null);
	const resizeStart = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

	// --- STYLES ---
	const classes = {
		right: cn("absolute top-0 right-0 bottom-3 w-1.5 cursor-ew-resize"),
		bottom: cn("absolute right-3 bottom-0 left-0 h-1.5 cursor-ns-resize"),
		bottomRight: cn("absolute right-0 bottom-0 h-3 w-3 cursor-nwse-resize"),
	};

	// --- HANDLERS ---
	function handleHandleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
		e.preventDefault();
		resizeDirection.current = e.currentTarget.dataset["direction"] as ResizeDirection;
		resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, width, height };
		focusApp(appId);
	}

	// --- EFFECTS ---
	useEffect(
		function setupResizeListeners() {
			function handleMouseMove(e: MouseEvent): void {
				if (!resizeDirection.current) return;

				const start = resizeStart.current;
				const canResizeWidth = resizeDirection.current !== "BOTTOM";
				const canResizeHeight = resizeDirection.current !== "RIGHT";

				resizeWindow(
					appId,
					canResizeWidth ? Math.max(minWidth, start.width + e.clientX - start.mouseX) : start.width,
					canResizeHeight ? Math.max(minHeight, start.height + e.clientY - start.mouseY) : start.height,
				);
			}

			function handleMouseUp(): void {
				resizeDirection.current = null;
			}

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return (): void => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		},
		[appId, minWidth, minHeight, resizeWindow],
	);

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
