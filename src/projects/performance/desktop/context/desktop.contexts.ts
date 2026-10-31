"use client";

import { createContext } from "react";

import type { OpenAppParams, OpenedApps } from "../desktop.types";

// The contexts live outside the provider file, so it only exports components and Fast Refresh keeps working.
// The state and the actions live in separate contexts, so the components that only call actions
// don't re-render when the opened apps change (e.g. on every frame of a window drag).
// Every action is a stable callback, so the actions value is created only once
export const DesktopStateContext = createContext<DesktopState | null>(null);
export const DesktopActionsContext = createContext<DesktopActions | null>(null);

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
