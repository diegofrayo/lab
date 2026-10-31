import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { AppId, OpenedApp, OpenedApps } from "../desktop.types";

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
				if (!isAppId(appId)) return [];

				return [[storedApp.id, { ...storedApp, appConfig: APPS_REPOSITORY[appId] }]];
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

// --- UTILS ---

// The stored apps can come from an older version where an app had another id or didn't exist
function isAppId(value: string): value is AppId {
	return Object.hasOwn(APPS_REPOSITORY, value);
}

// --- CONSTANTS ---

const OPENED_APPS_STORAGE_KEY = "performance:opened-apps";
