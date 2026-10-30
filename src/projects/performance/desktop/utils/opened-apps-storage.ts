import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { OpenedApp, OpenedApps } from "../desktop.types";

// The app config has functions, so it's not stored. It's restored from the apps repository using its id
type StoredOpenedApp = Omit<OpenedApp, "appConfig"> & {
	appId: string;
};

export function readOpenedApps(): OpenedApps {
	try {
		const rawValue = window.localStorage.getItem(OPENED_APPS_STORAGE_KEY);
		if (rawValue === null) return {};

		const storedApps = JSON.parse(rawValue) as StoredOpenedApp[];

		return Object.fromEntries(
			storedApps.flatMap(({ appId, ...storedApp }) => {
				const appConfig = APPS_REPOSITORY[appId];
				if (!appConfig) return [];

				return [[storedApp.id, { ...storedApp, appConfig }]];
			}),
		);
	} catch {
		return {};
	}
}

export function saveOpenedApps(openedApps: OpenedApps): void {
	const storedApps: StoredOpenedApp[] = Object.values(openedApps).map(({ appConfig, ...openedApp }) => ({
		...openedApp,
		appId: appConfig.id,
	}));

	try {
		window.localStorage.setItem(OPENED_APPS_STORAGE_KEY, JSON.stringify(storedApps));
	} catch {
		// The storage can be full or blocked. The apps are still usable, they just won't be restored
	}
}

// --- CONSTANTS ---

const OPENED_APPS_STORAGE_KEY = "performance:opened-apps";
