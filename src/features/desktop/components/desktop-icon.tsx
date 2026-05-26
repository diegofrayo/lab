"use client";

import cn from "@diegofrayo-pkg/cn";
import type ReactTypes from "@diegofrayo-pkg/types/react";

import { useDesktop } from "../desktop.hook";
import type { AppConfig } from "../desktop.types";

type DesktopIconProps = {
	appConfig: AppConfig;
};

function DesktopIcon({ appConfig }: DesktopIconProps): ReactTypes.JSXElement {
	const { openApp } = useDesktop();

	// --- STYLES ---
	const classes = {
		container: cn(
			"flex w-20 cursor-pointer select-none flex-col items-center gap-1 rounded p-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50",
		),
		icon: cn("text-4xl"),
		label: cn("text-center text-xs font-medium text-white drop-shadow"),
	};

	// --- HANDLERS ---
	function handleClick(): void {
		openApp(appConfig.id);
	}

	return (
		<button className={classes.container} onClick={handleClick} aria-label={`Open ${appConfig.name}`}>
			<span className={classes.icon}>{appConfig.icon}</span>
			<span className={classes.label}>{appConfig.name}</span>
		</button>
	);
}

export default DesktopIcon;
