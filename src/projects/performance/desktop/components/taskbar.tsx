"use client";

import cn from "@diegofrayo-pkg/cn";
import type ReactTypes from "@diegofrayo-pkg/types/react";

import { useDesktop } from "../context/desktop.hook";
import type { OpenedApp } from "../desktop.types";

function Taskbar(): ReactTypes.JSXElement {
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

function TaskbarButton({ openedApp }: TaskbarButtonProps): ReactTypes.JSXElement {
	// --- HOOKS ---
	const { minimizeApp, maximizeApp, focusApp } = useDesktop();

	// --- STYLES ---
	const classes = {
		button: cn(
			"flex h-8 cursor-pointer items-center gap-2 rounded px-3 text-sm transition-colors",
			openedApp.isFocused
				? "bg-white/20 text-white"
				: "text-white/70 hover:bg-white/10 hover:text-white",
			openedApp.status === "MINIMIZED" && "opacity-60",
		),
		icon: cn("text-base"),
	};

	// --- HANDLERS ---
	function handleClick(): void {
		if (openedApp.status === "MINIMIZED") {
			maximizeApp(openedApp.id);
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
			aria-label={openedApp.appConfig.name}
		>
			<span className={classes.icon}>{openedApp.appConfig.icon}</span>
			<span>{openedApp.appConfig.name}</span>
		</button>
	);
}
