"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";

import type ReactTypes from "@diegofrayo-pkg/types/react";

import { APPS_REPOSITORY } from "./apps-repository";
import type { OpenedApp, OpenedApps } from "./desktop.types";

export type DesktopContextValue = {
	openedApps: OpenedApps;
	openApp: (appId: string) => void;
	closeApp: (appId: string) => void;
	maximizeApp: (appId: string) => void;
	minimizeApp: (appId: string) => void;
	focusApp: (appId: string) => void;
	moveWindow: (appId: string, x: number, y: number) => void;
};

export const DesktopContext = createContext<DesktopContextValue | null>(null);

type DesktopProviderProps = {
	children: ReactNode;
};

export function DesktopProvider({ children }: DesktopProviderProps): ReactTypes.JSXElement {
	const [openedApps, setOpenedApps] = useState<OpenedApps>({});

	const openApp = useCallback((appId: string): void => {
		const appConfig = APPS_REPOSITORY[appId];
		if (!appConfig) return;

		setOpenedApps((prev) => {
			const unfocused = unfocusAll(prev);
			if (prev[appId]) {
				return {
					...unfocused,
					[appId]: { ...unfocused[appId]!, isFocused: true, status: "MAXIMIZED" },
				};
			}
			const offset = Object.keys(prev).length * 30;
			const newApp: OpenedApp = {
				id: appId,
				appConfig,
				status: "MAXIMIZED",
				isFocused: true,
				windowConfig: { x: 100 + offset, y: 80 + offset, width: 600, height: 420 },
			};
			return { ...unfocused, [appId]: newApp };
		});
	}, []);

	const closeApp = useCallback((appId: string): void => {
		setOpenedApps((prev) =>
			Object.fromEntries(Object.entries(prev).filter(([k]) => k !== appId)),
		);
	}, []);

	const maximizeApp = useCallback((appId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[appId]) return prev;
			const unfocused = unfocusAll(prev);
			return { ...unfocused, [appId]: { ...unfocused[appId]!, status: "MAXIMIZED", isFocused: true } };
		});
	}, []);

	const minimizeApp = useCallback((appId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[appId]) return prev;
			return { ...prev, [appId]: { ...prev[appId]!, status: "MINIMIZED", isFocused: false } };
		});
	}, []);

	const focusApp = useCallback((appId: string): void => {
		setOpenedApps((prev) => {
			if (!prev[appId]) return prev;
			const unfocused = unfocusAll(prev);
			return { ...unfocused, [appId]: { ...unfocused[appId]!, isFocused: true } };
		});
	}, []);

	const moveWindow = useCallback((appId: string, x: number, y: number): void => {
		setOpenedApps((prev) => {
			if (!prev[appId]) return prev;
			return {
				...prev,
				[appId]: { ...prev[appId]!, windowConfig: { ...prev[appId]!.windowConfig, x, y } },
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

function unfocusAll(apps: OpenedApps): OpenedApps {
	return Object.fromEntries(
		Object.entries(apps).map(([k, v]) => [k, { ...v, isFocused: false }]),
	);
}
