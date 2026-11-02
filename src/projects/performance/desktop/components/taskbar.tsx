"use client";

import { memo, type JSX } from "react";

import cn from "~/lib/cn";

import { useDesktopActions, useDesktopState } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";
import { getTaskbarButtonId } from "../utils/taskbar-button-id";
import { getWindowTitle } from "../utils/window-title";
import WindowIcon from "./window-icon";

function Taskbar(): JSX.Element {
	// --- HOOKS ---
	const { openedApps } = useDesktopState();

	return (
		<nav className={taskbarStyles.taskbar}>
			{Object.keys(openedApps).length === 0 ? (
				<span className={taskbarStyles.emptyLabel}>No open apps</span>
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

// --- STYLES ---

const taskbarStyles = {
	taskbar: cn(
		"flex h-12 items-center gap-1 border-t border-white/20 bg-gray-900/80 px-3 backdrop-blur-md",
	),
	emptyLabel: cn("text-xs text-white/40"),
};

export default Taskbar;

// --- COMPONENTS ---

// => TaskbarButton <=

type TaskbarButtonProps = {
	openedApp: OpenedApp;
};

// Memoized so a button only re-renders when its own opened app changes (e.g. not when another window is focused)
const TaskbarButton = memo(function TaskbarButton({ openedApp }: TaskbarButtonProps): JSX.Element {
	// --- HOOKS ---
	const { minimizeApp, restoreApp, focusApp } = useDesktopActions();

	// --- COMPUTED STATES ---
	const title = getWindowTitle(openedApp);

	// --- STYLES ---
	const styles = taskbarButtonStyles({
		isFocused: openedApp.isFocused,
		isMinimized: openedApp.status === "MINIMIZED",
	});

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
			id={getTaskbarButtonId(openedApp.id)}
			className={styles.button}
			aria-pressed={openedApp.isFocused}
			onClick={handleClick}
		>
			<WindowIcon openedApp={openedApp} />
			<span className={styles.title}>{title}</span>
		</button>
	);
});

const taskbarButtonStyles = ({ isFocused, isMinimized }: { isFocused: boolean; isMinimized: boolean }) =>
	({
		button: cn(
			"flex h-8 cursor-pointer items-center gap-2 rounded px-3 text-sm transition-colors",
			isFocused ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
			isMinimized && "opacity-60",
		),
		title: cn("max-w-40 truncate"),
	}) as const;
