import { z } from "zod";

import type { Product } from "../../apps/products/utils/products-parser";
import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { AppId, AppParams, OpenedApp, OpenedApps } from "../desktop.types";

// The app config has functions, so it's not stored. It's restored from the apps repository using its id
type StoredOpenedApp = Omit<OpenedApp, "appConfig"> & {
	appId: string;
};

export function readOpenedApps(): OpenedApps {
	try {
		const rawValue = window.localStorage.getItem(OPENED_APPS_STORAGE_KEY);
		if (rawValue === null) return {};

		const storedApps: unknown = JSON.parse(rawValue);
		if (!Array.isArray(storedApps)) return {};

		return Object.fromEntries(
			storedApps.flatMap((storedApp: unknown) => {
				const openedApp = parseStoredOpenedApp(storedApp);
				if (!openedApp) return [];

				return [[openedApp.id, openedApp]];
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

// Invalid entries are dropped (and logged), so a single malformed app does not discard the others
function parseStoredOpenedApp(storedApp: unknown): OpenedApp | null {
	const result = storedOpenedAppSchema.safeParse(storedApp);

	if (!result.success) {
		console.warn(
			"[opened-apps-storage] Invalid stored app dropped:",
			storedApp,
			z.prettifyError(result.error),
		);
		return null;
	}

	const { appId, params, ...openedApp } = result.data;

	if (!isAppId(appId)) return null;

	const paramsResult = APP_PARAMS_SCHEMAS[appId].safeParse(params);

	if (!paramsResult.success) {
		console.warn(
			"[opened-apps-storage] Invalid stored params dropped:",
			storedApp,
			z.prettifyError(paramsResult.error),
		);
		return null;
	}

	return { ...openedApp, params: paramsResult.data, appConfig: APPS_REPOSITORY[appId] };
}

// The stored apps can come from an older version where an app had another id or didn't exist
function isAppId(value: string): value is AppId {
	return Object.hasOwn(APPS_REPOSITORY, value);
}

// --- CONSTANTS ---

const OPENED_APPS_STORAGE_KEY = "performance:opened-apps";

// The stored product is the parsed one (camelCase), not the raw socket payload
const storedProductSchema = z.object({
	id: z.string().min(1),
	name: z.string(),
	photo: z.string(),
	price: z.number(),
	averagePrice: z.number(),
	averageSales: z.number(),
	totalSales: z.number(),
}) satisfies z.ZodType<Product>;

const APP_PARAMS_SCHEMAS: { [TAppId in AppId]: z.ZodType<AppParams<TAppId>> } = {
	PRODUCTS: z.undefined(),
	PRODUCT_DETAILS: z.object({ product: storedProductSchema }),
	DATA_ORCHESTRATOR: z.undefined(),
};

const storedOpenedAppSchema = z.object({
	id: z.string().min(1),
	appId: z.string(),
	status: z.enum(["MAXIMIZED", "MINIMIZED", "VISIBLE"]),
	statusBeforeMinimize: z.enum(["MAXIMIZED", "VISIBLE"]).exactOptional(),
	isFocused: z.boolean(),
	// `JSON.stringify` drops the `undefined` params, so the key can be missing
	params: z.unknown().optional(),
	windowConfig: z.object({
		x: z.number(),
		y: z.number(),
		width: z.number(),
		height: z.number(),
	}),
});
