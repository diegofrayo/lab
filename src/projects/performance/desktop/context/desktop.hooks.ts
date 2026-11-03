"use client";

import { use } from "react";

import {
	DesktopActionsContext,
	DesktopStateContext,
	type DesktopActions,
	type DesktopState,
} from "./desktop.contexts";

export function useDesktopState(): DesktopState {
	const context = use(DesktopStateContext);

	if (!context) {
		throw new Error("useDesktopState must be used within a DesktopProvider");
	}

	return context;
}

export function useDesktopActions(): DesktopActions {
	const context = use(DesktopActionsContext);

	if (!context) {
		throw new Error("useDesktopActions must be used within a DesktopProvider");
	}

	return context;
}
