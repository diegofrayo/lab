"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import { useDesktopState } from "../context/desktop.hook";
import type { AppConfig, AppIdWithoutParams } from "../desktop.types";
import DesktopIcon from "./desktop-icon";
import Taskbar from "./taskbar";
import Window from "./window";

function Desktop(): JSX.Element {
	// --- HOOKS ---
	const { openedApps } = useDesktopState();

	return (
		<main className={styles.root}>
			<section className={styles.desktop}>
				<div className={styles.windowsArea}>
					{Object.values(openedApps).map((openedApp) => (
						<Window
							key={openedApp.id}
							openedApp={openedApp}
						/>
					))}
				</div>
				<div className={styles.iconsArea}>
					{DESKTOP_APPS.map((appConfig) => (
						<DesktopIcon
							key={appConfig.id}
							appConfig={appConfig}
						/>
					))}
				</div>
			</section>
			<Taskbar />
		</main>
	);
}

// --- STYLES ---

const styles = {
	root: cn("flex h-screen flex-col overflow-hidden"),
	desktop: cn(
		"relative flex-1 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900",
	),
	iconsArea: cn("flex flex-col items-start gap-2 p-4"),
	windowsArea: cn("pointer-events-none absolute inset-0"),
};

export default Desktop;

// --- CONSTANTS ---

const DESKTOP_APPS = Object.values(APPS_REPOSITORY).filter(isDesktopApp);

// --- UTILS ---

// Apps that need params are hidden from the desktop, so the visible ones can be opened without params
function isDesktopApp(appConfig: AppConfig): appConfig is AppConfig<AppIdWithoutParams> {
	return !appConfig.isHiddenFromDesktop;
}
