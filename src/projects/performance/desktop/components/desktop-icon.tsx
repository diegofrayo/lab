"use client";

import { memo, type JSX } from "react";

import cn from "~/lib/cn";

import { useDesktopActions } from "../context/desktop.hook";
import type { AppConfig, AppIdWithoutParams } from "../desktop.types";

type DesktopIconProps = {
	appConfig: AppConfig<AppIdWithoutParams>;
};

function DesktopIcon({ appConfig }: DesktopIconProps): JSX.Element {
	// --- HOOKS ---
	const { openApp } = useDesktopActions();

	// --- STYLES ---
	const classes = {
		container: cn(
			"flex w-20 cursor-pointer flex-col items-center gap-1 rounded p-2 select-none hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none",
		),
		icon: cn("text-4xl"),
		label: cn("text-center text-xs font-medium text-white drop-shadow"),
	};

	// --- HANDLERS ---
	function handleClick(): void {
		openApp({ appId: appConfig.id });
	}

	return (
		<button
			className={classes.container}
			aria-label={`Open ${appConfig.name}`}
			onClick={handleClick}
		>
			<span className={classes.icon}>{appConfig.icon}</span>
			<span className={classes.label}>{appConfig.name}</span>
		</button>
	);
}

// Memoized so it doesn't re-render when the desktop re-renders (e.g. on every frame of a window drag),
// since its only prop is a static app config
export default memo(DesktopIcon);
