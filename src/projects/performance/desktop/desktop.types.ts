export type AppConfig = {
	id: string;
	name: string;
	icon: string;
	// Apps that need params (e.g. a product) are opened by other apps, not from the desktop
	isHiddenFromDesktop?: boolean;
	allowMultipleInstances?: boolean;
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
};

export type AppsRepository = Record<string, AppConfig>;

export type OpenedApp = {
	id: string;
	appConfig: AppConfig;
	status: "MAXIMIZED" | "MINIMIZED" | "VISIBLE";
	isFocused: boolean;
	params: AppParams;
	windowConfig: NonNullable<AppConfig["windowConfig"]>;
};

export type OpenedApps = Record<string, OpenedApp>;
