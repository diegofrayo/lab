import type { OpenedApp } from "../desktop.types";

export function getWindowTitle(openedApp: OpenedApp): string {
	return openedApp.appConfig.getWindowTitle?.(openedApp.params) || openedApp.appConfig.name;
}
