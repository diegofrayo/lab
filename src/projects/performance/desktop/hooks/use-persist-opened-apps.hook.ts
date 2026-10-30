"use client";

import { useEffect } from "react";

import type { OpenedApps } from "../desktop.types";
import { saveOpenedApps } from "../utils/opened-apps-storage";

// Saves the opened apps in the local storage every time they change, so they are restored on reload
export function usePersistOpenedApps(openedApps: OpenedApps): void {
	useEffect(
		function persistOpenedApps() {
			saveOpenedApps(openedApps);
		},
		[openedApps],
	);
}
