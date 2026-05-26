"use client";

import { type ReactNode, useEffect, useRef } from "react";

import cn from "@diegofrayo-pkg/cn";
import type ReactTypes from "@diegofrayo-pkg/types/react";

import { useDesktop } from "../desktop.hook";
import type { OpenedApp } from "../desktop.types";

type WindowProps = {
	openedApp: OpenedApp;
	children: ReactNode;
};

function Window({ openedApp, children }: WindowProps): ReactTypes.JSXElementNullable {
	const { closeApp, minimizeApp, maximizeApp, focusApp, moveWindow } = useDesktop();

	// --- REFS ---
	const isDragging = useRef(false);
	const dragStart = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });

	const { id, appConfig, windowConfig, isFocused, status } = openedApp;

	// --- STYLES ---
	const classes = {
		container: cn(
			"absolute flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl transition-shadow",
			isFocused ? "z-50 shadow-black/30" : "z-10 shadow-black/10",
		),
		titleBar: cn(
			"flex cursor-grab select-none items-center justify-between px-3 py-2",
			isFocused ? "bg-gray-200" : "bg-gray-100",
		),
		titleInfo: cn("flex items-center gap-2 text-sm font-medium text-gray-700"),
		titleIcon: cn("text-base"),
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
		content: cn("flex-1 overflow-auto bg-white p-4"),
	};

	// --- HANDLERS ---
	function handleTitleBarMouseDown(e: ReactTypes.Events.OnClickEvent<HTMLElement>): void {
		isDragging.current = true;
		dragStart.current = {
			mouseX: e.clientX,
			mouseY: e.clientY,
			windowX: windowConfig.x,
			windowY: windowConfig.y,
		};
		focusApp(id);
	}

	function handleContainerMouseDown(): void {
		focusApp(id);
	}

	function handleCloseClick(e: ReactTypes.Events.OnClickEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		closeApp(id);
	}

	function handleMinimizeClick(e: ReactTypes.Events.OnClickEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		minimizeApp(id);
	}

	function handleMaximizeClick(e: ReactTypes.Events.OnClickEvent<HTMLButtonElement>): void {
		e.stopPropagation();
		maximizeApp(id);
	}

	// --- EFFECTS ---
	useEffect(
		function setupDragListeners() {
			function handleMouseMove(e: MouseEvent): void {
				if (!isDragging.current) return;
				const dx = e.clientX - dragStart.current.mouseX;
				const dy = e.clientY - dragStart.current.mouseY;
				moveWindow(id, dragStart.current.windowX + dx, dragStart.current.windowY + dy);
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
		[id, moveWindow],
	);

	if (status === "MINIMIZED") return null;

	return (
		<div
			className={classes.container}
			style={{
				left: windowConfig.x,
				top: windowConfig.y,
				width: windowConfig.width,
				height: windowConfig.height,
			}}
			onMouseDown={handleContainerMouseDown}
			role="dialog"
			aria-label={appConfig.name}
		>
			<header className={classes.titleBar} onMouseDown={handleTitleBarMouseDown}>
				<div className={classes.titleInfo}>
					<span className={classes.titleIcon}>{appConfig.icon}</span>
					<span>{appConfig.name}</span>
				</div>
				<div className={classes.titleButtons}>
					<button className={classes.btnMinimize} onClick={handleMinimizeClick} aria-label="Minimize" />
					<button className={classes.btnMaximize} onClick={handleMaximizeClick} aria-label="Maximize" />
					<button className={classes.btnClose} onClick={handleCloseClick} aria-label="Close" />
				</div>
			</header>
			<section className={classes.content}>{children}</section>
		</div>
	);
}

export default Window;
