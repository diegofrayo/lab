"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";
import type { JSX } from "react";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { AppConfig, AppParams, OpenedApp, OpenedApps } from "../desktop.types";
import { usePersistOpenedApps } from "../hooks/use-persist-opened-apps.hook";
import { readOpenedApps } from "../utils/opened-apps-storage";
import { getInitialWindowSize } from "../utils/window-size";

export const DesktopContext = createContext<DesktopContextValue | null>(null);

type DesktopProviderProps = {
	children: ReactNode;
};

export function DesktopProvider({ children }: DesktopProviderProps): JSX.Element {
	// The opened apps are read from the local storage, so this provider must be rendered only on the client
	const [openedApps, setOpenedApps] = useState<OpenedApps>(readOpenedApps);
	usePersistOpenedApps(openedApps);

	const openApp = useCallback((targetAppId: string, params: AppParams = {}): void => {
		const appConfig = APPS_REPOSITORY[targetAppId];
		if (!appConfig) return;

		const windowId = getWindowId(appConfig, params);

		setOpenedApps((prev) => {
			const updatedState = unfocusAllApps(prev);
			const openedApp = updatedState[windowId];

			if (openedApp) {
				return {
					...updatedState,
					[windowId]: {
						...openedApp,
						status: openedApp.status === "MINIMIZED" ? getRestoredStatus(openedApp) : openedApp.status,
						isFocused: true,
						params,
					},
				};
			}

			const offset = Object.keys(prev).length * 30;
			const newApp: OpenedApp = {
				id: windowId,
				appConfig,
				status: "VISIBLE",
				isFocused: true,
				params,
				windowConfig: {
					x: 100 + offset,
					y: 80 + offset,
					...getInitialWindowSize(appConfig),
				},
			};

			return {
				...updatedState,
				[windowId]: newApp,
			};
		});
	}, []);

	const closeApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) =>
			Object.fromEntries(Object.entries(prev).filter(([appId]) => appId !== targetAppId)),
		);
	}, []);

	const maximizeApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId] || !isMaximizable(prev[targetAppId].appConfig)) return prev;

			const updatedState = unfocusAllApps(prev);

			return {
				...updatedState,
				[targetAppId]: {
					...updatedState[targetAppId]!,
					status: "MAXIMIZED",
					isFocused: true,
				},
			};
		});
	}, []);

	// The window keeps its last size and position while maximized, so restoring only changes the status.
	// A minimized window goes back to the status it had before being minimized
	const restoreApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId]) return prev;

			const updatedState = unfocusAllApps(prev);

			return {
				...updatedState,
				[targetAppId]: {
					...updatedState[targetAppId]!,
					status: getRestoredStatus(updatedState[targetAppId]!),
					isFocused: true,
				},
			};
		});
	}, []);

	const minimizeApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId] || prev[targetAppId].status === "MINIMIZED") return prev;

			return {
				...prev,
				[targetAppId]: {
					...prev[targetAppId],
					status: "MINIMIZED",
					statusBeforeMinimize: prev[targetAppId].status,
					isFocused: false,
				},
			};
		});
	}, []);

	const focusApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId]) return prev;

			return {
				...unfocusAllApps(prev),
				[targetAppId]: {
					...prev[targetAppId],
					isFocused: true,
				},
			};
		});
	}, []);

	const moveWindow = useCallback((targetAppId: string, x: number, y: number): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId]) return prev;

			return {
				...prev,
				[targetAppId]: {
					...prev[targetAppId],
					windowConfig: {
						...prev[targetAppId].windowConfig,
						x,
						y,
					},
				},
			};
		});
	}, []);

	const resizeWindow = useCallback((targetAppId: string, width: number, height: number): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId]) return prev;

			return {
				...prev,
				[targetAppId]: {
					...prev[targetAppId],
					windowConfig: {
						...prev[targetAppId].windowConfig,
						width,
						height,
					},
				},
			};
		});
	}, []);

	return (
		<DesktopContext.Provider
			value={{
				openedApps,
				openApp,
				closeApp,
				maximizeApp,
				restoreApp,
				minimizeApp,
				focusApp,
				moveWindow,
				resizeWindow,
			}}
		>
			{children}
		</DesktopContext.Provider>
	);
}

// --- TYPES ---

export type DesktopContextValue = {
	openedApps: OpenedApps;
	openApp: (targetAppId: string, params?: AppParams) => void;
	closeApp: (targetAppId: string) => void;
	maximizeApp: (targetAppId: string) => void;
	restoreApp: (targetAppId: string) => void;
	minimizeApp: (targetAppId: string) => void;
	focusApp: (targetAppId: string) => void;
	moveWindow: (targetAppId: string, x: number, y: number) => void;
	resizeWindow: (targetAppId: string, width: number, height: number) => void;
};

//  --- UTILS ---

// Apps with multiple instances get one window per set of params (e.g. one per product),
// so opening the same params again focuses the existing window instead of creating a new one
function getWindowId(appConfig: AppConfig, params: AppParams): string {
	if (!appConfig.allowMultipleInstances) return appConfig.id;

	const searchParams = new URLSearchParams(
		Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
	);

	return `${appConfig.id}?${searchParams.toString()}`;
}

function isMaximizable(appConfig: AppConfig): boolean {
	return appConfig.isMaximizable ?? true;
}

function getRestoredStatus(app: OpenedApp): OpenedApp["status"] {
	if (app.status === "MINIMIZED") return app.statusBeforeMinimize ?? "VISIBLE";
	if (app.status === "MAXIMIZED") return "VISIBLE";
	return app.status;
}

function unfocusAllApps(apps: OpenedApps): OpenedApps {
	return Object.fromEntries(
		Object.entries(apps).map(([appId, appConfig]) => {
			return [appId, { ...appConfig, isFocused: false }];
		}),
	);
}
