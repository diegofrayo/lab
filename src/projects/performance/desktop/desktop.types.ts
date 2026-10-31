export type AppConfig = {
	id: string;
	name: string;
	icon: string;
	// Replaces `icon` in the window and the taskbar with an image built from the params (e.g. a product photo)
	getWindowIconUrl?: (params: AppParams) => string | undefined;
	// Replaces `name` in the window and the taskbar with a title built from the params (e.g. a product name)
	getWindowTitle?: (params: AppParams) => string | undefined;
	// Apps that need params (e.g. a product) are opened by other apps, not from the desktop
	isHiddenFromDesktop?: boolean;
	// Opens a window per set of params instead of reusing a single window
	allowMultipleInstances?: boolean;
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

// Data an app is opened with, like the query params of a URL
export type AppParams = Record<string, string>;

export type AppProps = {
	params: AppParams;
	// Minimized apps stay mounted (to keep their state) but must stop their background work (e.g. sockets)
	isMinimized: boolean;
};

export type AppsRepository = Record<string, AppConfig>;

export type OpenedApp = {
	// The window id. It's the app id, or the app id plus its params when the app allows multiple instances
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
