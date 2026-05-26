export type AppConfig = {
	id: string;
	name: string;
	icon: string;
	windowConfig?: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
};

export type AppsRepository = Record<string, AppConfig>;

export type OpenedApp = {
	id: string;
	appConfig: AppConfig;
	status: "MAXIMIZED" | "MINIMIZED";
	isFocused: boolean;
	windowConfig: NonNullable<AppConfig["windowConfig"]>;
};

export type OpenedApps = Record<string, OpenedApp>;
