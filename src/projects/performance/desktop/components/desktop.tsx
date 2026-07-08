"use client";

import cn from "@diegofrayo-pkg/cn";
import type ReactTypes from "@diegofrayo-pkg/types/react";

import { APPS_COMPONENTS } from "~/projects/performance/apps";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import { useDesktop } from "../context/desktop.hook";
import DesktopIcon from "./desktop-icon";
import Taskbar from "./taskbar";
import Window from "./window";

function Desktop(): ReactTypes.JSXElement {
	// --- HOOKS ---
	const { openedApps } = useDesktop();

	// --- STYLES ---
	const classes = {
		root: cn("flex h-screen flex-col overflow-hidden"),
		desktop: cn(
			"relative flex-1 overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900",
		),
		iconsArea: cn("flex flex-col items-start gap-2 p-4"),
		windowsArea: cn("absolute inset-0"),
	};

	return (
		<main className={classes.root}>
			<section className={classes.desktop}>
				<div className={classes.windowsArea}>
					{Object.values(openedApps).map((openedApp) => {
						const AppComponent = APPS_COMPONENTS[openedApp.id];
						if (!AppComponent) return null;

						return (
							<Window
								key={openedApp.id}
								openedApp={openedApp}
							>
								<AppComponent />
							</Window>
						);
					})}
				</div>
				<div className={classes.iconsArea}>
					{Object.values(APPS_REPOSITORY).map((appConfig) => (
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
