"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";
import type { JSX } from "react";

import { APPS_REPOSITORY } from "../constants/apps-repository";
import type { OpenedApp, OpenedApps } from "../desktop.types";

export const DesktopContext = createContext<DesktopContextValue | null>(null);

type DesktopProviderProps = {
	children: ReactNode;
};

export function DesktopProvider({ children }: DesktopProviderProps): JSX.Element {
	const [openedApps, setOpenedApps] = useState<OpenedApps>({});

	const openApp = useCallback((targetAppId: string): void => {
		const appConfig = APPS_REPOSITORY[targetAppId];
		if (!appConfig) return;

		setOpenedApps((prev) => {
			const updatedState = unfocusAllApps(prev);

			if (updatedState[targetAppId]) {
				return {
					...updatedState,
					[targetAppId]: {
						...updatedState[targetAppId],
						isFocused: true,
					},
				};
			}

			const offset = Object.keys(prev).length * 30;
			const newApp: OpenedApp = {
				id: targetAppId,
				appConfig,
				status: "VISIBLE",
				isFocused: true,
				windowConfig: {
					x: 100 + offset,
					y: 80 + offset,
					width: appConfig.windowConfig?.width || 600,
					height: appConfig.windowConfig?.height || 420,
				},
			};

			return {
				...updatedState,
				[targetAppId]: newApp,
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
			if (!prev[targetAppId]) return prev;

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

	const minimizeApp = useCallback((targetAppId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[targetAppId]) return prev;

			return {
				...prev,
				[targetAppId]: {
					...prev[targetAppId],
					status: "MINIMIZED",
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

	return (
		<DesktopContext.Provider
			value={{ openedApps, openApp, closeApp, maximizeApp, minimizeApp, focusApp, moveWindow }}
		>
			{children}
		</DesktopContext.Provider>
	);
}

// --- TYPES ---

export type DesktopContextValue = {
	openedApps: OpenedApps;
	openApp: (targetAppId: string) => void;
	closeApp: (targetAppId: string) => void;
	maximizeApp: (targetAppId: string) => void;
	minimizeApp: (targetAppId: string) => void;
	focusApp: (targetAppId: string) => void;
	moveWindow: (targetAppId: string, x: number, y: number) => void;
};

//  --- UTILS ---

function unfocusAllApps(apps: OpenedApps): OpenedApps {
	return Object.fromEntries(
		Object.entries(apps).map(([appId, appConfig]) => {
			return [appId, { ...appConfig, isFocused: false }];
		}),
	);
}
