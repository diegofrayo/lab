"use client";

import { Activity, memo, Suspense, type ComponentType, type CSSProperties, type JSX } from "react";

import cn from "~/lib/cn";
import { APPS_COMPONENTS } from "~/projects/performance/apps";

import { useDesktopActions } from "../context/desktop.hooks";
import type { AppProps, OpenedApp } from "../desktop.types";
import { useWindowDrag } from "../hooks/use-window-drag.hook";
import { useWindowKeyboardFocus } from "../hooks/use-window-keyboard-focus.hook";
import { getTaskbarButtonId } from "../utils/taskbar-button-id";
import { getMinWindowSize } from "../utils/window-size";
import { getWindowTitle } from "../utils/window-title";
import AppErrorBoundary from "./app-error-boundary";
import WindowIcon from "./window-icon";
import WindowLoader from "./window-loader";
import WindowResizeHandles from "./window-resize-handles";

type WindowProps = {
	openedApp: OpenedApp;
};

function Window({ openedApp }: WindowProps): JSX.Element {
	// --- HOOKS ---
	const { closeApp, minimizeApp, maximizeApp, restoreApp, focusApp } = useDesktopActions();
	const { containerRef, startDrag } = useWindowDrag({
		appId: openedApp.id,
		windowConfig: openedApp.windowConfig,
	});
	const { returnFocusToOpener } = useWindowKeyboardFocus({
		containerRef,
		isFocused: openedApp.isFocused,
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
	const styles = windowStyles({ isFocused, isMinimized, isMaximized });

	// --- HANDLERS ---
	function handleTitleBarMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
		// The drag moves the window element directly, so a maximized window would leave its full-size spot
		if (!isMaximized) startDrag(e);
		focusApp(id);
	}

	function handleContainerMouseDown(): void {
		focusApp(id);
	}

	function handleCloseClick(e: React.MouseEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		closeWindow();
	}

	function handleMinimizeClick(e: React.MouseEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		minimizeApp(id);
		document.getElementById(getTaskbarButtonId(id))?.focus();
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
	function closeWindow(): void {
		closeApp(id);
		returnFocusToOpener();
	}

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

	return (
		<div
			ref={containerRef}
			className={styles.container}
			style={getWindowStyles()}
			role="dialog"
			aria-label={title}
			tabIndex={-1}
			onMouseDown={handleContainerMouseDown}
		>
			<header
				className={styles.titleBar}
				onMouseDown={handleTitleBarMouseDown}
			>
				<div className={styles.titleInfo}>
					<WindowIcon openedApp={openedApp} />
					<span className={styles.title}>{title}</span>
				</div>
				<div className={styles.titleButtons}>
					<button
						className={styles.btnMinimize}
						onClick={handleMinimizeClick}
						aria-label="Minimize"
					/>
					{hasMaximizeButton && (
						<button
							className={styles.btnMaximize}
							onClick={handleMaximizeClick}
							aria-label={isMaximized ? "Restore" : "Maximize"}
						/>
					)}
					<button
						className={styles.btnClose}
						onClick={handleCloseClick}
						aria-label="Close"
					/>
				</div>
			</header>
			<section className={styles.content}>
				{/* A minimized window is hidden instead of unmounted, so its app keeps its state. Activity
				also cleans up the app's effects (e.g. sockets) while hidden and runs them again on restore */}
				<Activity mode={isMinimized ? "hidden" : "visible"}>
					<AppErrorBoundary
						appName={title}
						onClose={closeWindow}
					>
						<WindowApp openedApp={openedApp} />
					</AppErrorBoundary>
				</Activity>
			</section>
			{isResizable && (
				<WindowResizeHandles
					appId={id}
					containerRef={containerRef}
					width={windowConfig.width}
					height={windowConfig.height}
					minWidth={minWindowSize.width}
					minHeight={minWindowSize.height}
				/>
			)}
		</div>
	);
}

// --- STYLES ---

const windowStyles = ({
	isFocused,
	isMinimized,
	isMaximized,
}: {
	isFocused: boolean;
	isMinimized: boolean;
	isMaximized: boolean;
}) =>
	({
		container: cn(
			"pointer-events-auto absolute flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl transition-shadow outline-none",
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
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
		btnMinimize: cn(
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
		btnMaximize: cn(
			"flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-green-500 hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
		content: cn("relative flex-1 overflow-auto bg-white p-4"),
	}) as const;

// Memoized so a window only re-renders when its own opened app changes (e.g. not when another window is focused)
export default memo(Window);

// --- COMPONENTS ---

// => WindowApp <=

type WindowAppProps = {
	openedApp: OpenedApp;
};

function WindowApp({ openedApp }: WindowAppProps): JSX.Element {
	// TS can't relate the component to the params of the same app, but both come from the same app id
	const AppComponent = APPS_COMPONENTS[openedApp.appConfig.id] as ComponentType<AppProps>;

	// The apps are lazy-loaded, so the loader is shown while the app's code is downloading
	return (
		<Suspense fallback={<WindowLoader text="Loading" />}>
			<AppComponent params={openedApp.params} />
		</Suspense>
	);
}
