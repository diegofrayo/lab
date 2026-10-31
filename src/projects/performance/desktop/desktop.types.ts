import type { Product } from "../apps/products/utils/products-parser";

// Data each app is opened with. Apps without params are opened with `undefined`
type AppsParams = {
	PRODUCTS: undefined;
	PRODUCT_DETAILS: { product: Product };
	DATA_ORCHESTRATOR: undefined;
};

export type AppId = keyof AppsParams;

export type AppParams<TAppId extends AppId = AppId> = AppsParams[TAppId];

export type AppIdWithoutParams = {
	[TAppId in AppId]: AppParams<TAppId> extends undefined ? TAppId : never;
}[AppId];

// The argument of `openApp`. The params are required only for the apps that need them
export type OpenAppParams = {
	[TAppId in AppId]: AppParams<TAppId> extends undefined
		? { appId: TAppId }
		: { appId: TAppId; params: AppParams<TAppId> };
}[AppId];

// The functions use the method syntax so an `AppConfig<"PRODUCT_DETAILS">` can be used as an `AppConfig`
export type AppConfig<TAppId extends AppId = AppId> = {
	id: TAppId;
	name: string;
	icon: string;
	// Replaces `icon` in the window and the taskbar with an image built from the params (e.g. a product photo)
	getWindowIconUrl?(params: AppParams<TAppId>): string | undefined;
	// Replaces `name` in the window and the taskbar with a title built from the params (e.g. a product name)
	getWindowTitle?(params: AppParams<TAppId>): string | undefined;
	// Opens a window per instance id (e.g. one per product) instead of reusing a single window
	getInstanceId?(params: AppParams<TAppId>): string;
	// Apps that need params (e.g. a product) are opened by other apps, not from the desktop
	isHiddenFromDesktop?: boolean;
	// Defaults to true
	isMaximizable?: boolean;
	// Defaults to true
	isResizable?: boolean;
	// Defaults to 768 x 768
	minWindowSize?: {
		width: number;
		height: number;
	};
	windowConfig?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
};

export type AppProps<TAppId extends AppId = AppId> = {
	params: AppParams<TAppId>;
	// Minimized apps stay mounted (to keep their state) but must stop their background work (e.g. sockets)
	isMinimized: boolean;
};

export type AppsRepository = {
	[TAppId in AppId]: AppConfig<TAppId>;
};

export type OpenedApp = {
	// The window id. It's the app id, or the app id plus its instance id when the app has multiple instances
	id: string;
	appConfig: AppConfig;
	status: "MAXIMIZED" | "MINIMIZED" | "VISIBLE";
	// Used to bring a minimized window back to the status it had before
	statusBeforeMinimize?: "MAXIMIZED" | "VISIBLE";
	isFocused: boolean;
	params: AppParams;
	windowConfig: NonNullable<AppConfig["windowConfig"]>;
};

export type OpenedApps = Record<string, OpenedApp>;
