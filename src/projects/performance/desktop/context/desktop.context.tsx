"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import type { JSX } from "react";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { AppConfig, AppParams, OpenAppParams, OpenedApp, OpenedApps } from "../desktop.types";
import { usePersistOpenedApps } from "../hooks/use-persist-opened-apps.hook";
import { readOpenedApps } from "../utils/opened-apps-storage";
import { getInitialWindowSize } from "../utils/window-size";

// The state and the actions live in separate contexts, so the components that only call actions
// don't re-render when the opened apps change (e.g. on every frame of a window drag).
// Every action is a stable callback, so the actions value is created only once
export const DesktopStateContext = createContext<DesktopState | null>(null);
export const DesktopActionsContext = createContext<DesktopActions | null>(null);

type DesktopProviderProps = {
	children: ReactNode;
};

export function DesktopProvider({ children }: DesktopProviderProps): JSX.Element {
	// The opened apps are read from the local storage, so this provider must be rendered only on the client
	const [openedApps, setOpenedApps] = useState<OpenedApps>(readOpenedApps);
	usePersistOpenedApps(openedApps);

	const openApp = useCallback((openAppParams: OpenAppParams): void => {
		const appConfig: AppConfig = APPS_REPOSITORY[openAppParams.appId];
		const params = "params" in openAppParams ? openAppParams.params : undefined;
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
		setOpenedApps((prev) => updateWindowConfig(prev, targetAppId, { x, y }));
	}, []);

	const resizeWindow = useCallback((targetAppId: string, width: number, height: number): void => {
		setOpenedApps((prev) => updateWindowConfig(prev, targetAppId, { width, height }));
	}, []);

	const state = useMemo<DesktopState>(() => ({ openedApps }), [openedApps]);

	const actions = useMemo<DesktopActions>(
		() => ({
			openApp,
			closeApp,
			maximizeApp,
			restoreApp,
			minimizeApp,
			focusApp,
			moveWindow,
			resizeWindow,
		}),
		[openApp, closeApp, maximizeApp, restoreApp, minimizeApp, focusApp, moveWindow, resizeWindow],
	);

	return (
		<DesktopActionsContext.Provider value={actions}>
			<DesktopStateContext.Provider value={state}>{children}</DesktopStateContext.Provider>
		</DesktopActionsContext.Provider>
	);
}

// --- TYPES ---

export type DesktopState = {
	openedApps: OpenedApps;
};

export type DesktopActions = {
	openApp: (openAppParams: OpenAppParams) => void;
	closeApp: (targetAppId: string) => void;
	maximizeApp: (targetAppId: string) => void;
	restoreApp: (targetAppId: string) => void;
	minimizeApp: (targetAppId: string) => void;
	focusApp: (targetAppId: string) => void;
	moveWindow: (targetAppId: string, x: number, y: number) => void;
	resizeWindow: (targetAppId: string, width: number, height: number) => void;
};

//  --- UTILS ---

// Apps with multiple instances get one window per instance id (e.g. one per product),
// so opening the same instance again focuses the existing window instead of creating a new one
function getWindowId(appConfig: AppConfig, params: AppParams): string {
	if (!appConfig.getInstanceId) return appConfig.id;

	return `${appConfig.id}?${appConfig.getInstanceId(params)}`;
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

function updateWindowConfig(
	apps: OpenedApps,
	targetAppId: string,
	windowConfig: Partial<OpenedApp["windowConfig"]>,
): OpenedApps {
	if (!apps[targetAppId]) return apps;

	return {
		...apps,
		[targetAppId]: {
			...apps[targetAppId],
			windowConfig: {
				...apps[targetAppId].windowConfig,
				...windowConfig,
			},
		},
	};
}
