"use client";

import { useContext } from "react";

import {
	DesktopActionsContext,
	DesktopStateContext,
	type DesktopActions,
	type DesktopState,
} from "./desktop.context";

export function useDesktopState(): DesktopState {
	const context = useContext(DesktopStateContext);

	if (!context) {
		throw new Error("useDesktopState must be used within a DesktopProvider");
	}

	return context;
}

export function useDesktopActions(): DesktopActions {
	const context = useContext(DesktopActionsContext);

	if (!context) {
		throw new Error("useDesktopActions must be used within a DesktopProvider");
	}

	return context;
}
