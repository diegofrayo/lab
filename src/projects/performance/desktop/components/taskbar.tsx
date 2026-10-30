"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import { useDesktop } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";
import { getWindowTitle } from "../utils/window-title";
import WindowIcon from "./window-icon";

function Taskbar(): JSX.Element {
	// --- HOOKS ---
	const { openedApps } = useDesktop();

	// --- STYLES ---
	const classes = {
		taskbar: cn(
			"flex h-12 items-center gap-1 border-t border-white/20 bg-gray-900/80 px-3 backdrop-blur-md",
		),
		emptyLabel: cn("text-xs text-white/40"),
	};

	return (
		<nav className={classes.taskbar}>
			{Object.keys(openedApps).length === 0 ? (
				<span className={classes.emptyLabel}>No open apps</span>
			) : (
				Object.values(openedApps).map((openedApp) => (
					<TaskbarButton
						key={openedApp.id}
						openedApp={openedApp}
					/>
				))
			)}
		</nav>
	);
}

export default Taskbar;

// --- COMPONENTS ---

type TaskbarButtonProps = {
	openedApp: OpenedApp;
};

function TaskbarButton({ openedApp }: TaskbarButtonProps): JSX.Element {
	// --- HOOKS ---
	const { minimizeApp, restoreApp, focusApp } = useDesktop();

	// --- COMPUTED STATES ---
	const title = getWindowTitle(openedApp);

	// --- STYLES ---
	const classes = {
		button: cn(
			"flex h-8 cursor-pointer items-center gap-2 rounded px-3 text-sm transition-colors",
			openedApp.isFocused
				? "bg-white/20 text-white"
				: "text-white/70 hover:bg-white/10 hover:text-white",
			openedApp.status === "MINIMIZED" && "opacity-60",
		),
		title: cn("max-w-40 truncate"),
	};

	// --- HANDLERS ---
	function handleClick(): void {
		if (openedApp.status === "MINIMIZED") {
			restoreApp(openedApp.id);
		} else if (openedApp.isFocused) {
			minimizeApp(openedApp.id);
		} else {
			focusApp(openedApp.id);
		}
	}

	return (
		<button
			className={classes.button}
			onClick={handleClick}
			aria-label={title}
		>
			<WindowIcon openedApp={openedApp} />
			<span className={classes.title}>{title}</span>
		</button>
	);
}
