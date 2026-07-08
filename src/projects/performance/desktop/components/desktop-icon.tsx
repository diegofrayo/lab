"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useDesktop } from "../context/desktop.hook";
import type { AppConfig } from "../desktop.types";

type DesktopIconProps = {
	appConfig: AppConfig;
};

function DesktopIcon({ appConfig }: DesktopIconProps): JSX.Element {
	// --- HOOKS ---
	const { openApp } = useDesktop();

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
		openApp(appConfig.id);
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

export default DesktopIcon;
