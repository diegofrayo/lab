"use client";

import type { ComponentType, JSX } from "react";

import cn from "~/lib/cn";
import { APPS_COMPONENTS } from "~/projects/performance/apps";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import { useDesktop } from "../context/desktop.hook";
import type { AppConfig, AppIdWithoutParams, AppProps } from "../desktop.types";
import DesktopIcon from "./desktop-icon";
import Taskbar from "./taskbar";
import Window from "./window";

function Desktop(): JSX.Element {
	// --- HOOKS ---
	const { openedApps } = useDesktop();

	// --- STYLES ---
	const classes = {
		root: cn("flex h-screen flex-col overflow-hidden"),
		desktop: cn(
			"relative flex-1 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900",
		),
		iconsArea: cn("flex flex-col items-start gap-2 p-4"),
		windowsArea: cn("pointer-events-none absolute inset-0"),
	};

	return (
		<main className={classes.root}>
			<section className={classes.desktop}>
				<div className={classes.windowsArea}>
					{Object.values(openedApps).map((openedApp) => {
						// TS can't relate the component to the params of the same app, but both come from the same app id
						const AppComponent = APPS_COMPONENTS[openedApp.appConfig.id] as ComponentType<AppProps>;

						return (
							<Window
								key={openedApp.id}
								openedApp={openedApp}
							>
								<AppComponent
									params={openedApp.params}
									isMinimized={openedApp.status === "MINIMIZED"}
								/>
							</Window>
						);
					})}
				</div>
				<div className={classes.iconsArea}>
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

export default Desktop;

// --- CONSTANTS ---

const DESKTOP_APPS = Object.values(APPS_REPOSITORY).filter(isDesktopApp);

// --- UTILS ---

// Apps that need params are hidden from the desktop, so the visible ones can be opened without params
function isDesktopApp(appConfig: AppConfig): appConfig is AppConfig<AppIdWithoutParams> {
	return !appConfig.isHiddenFromDesktop;
}
