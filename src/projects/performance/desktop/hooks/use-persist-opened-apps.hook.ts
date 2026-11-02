"use client";

import { useEffect } from "react";

import type { OpenedApps } from "../desktop.types";
import { saveOpenedApps } from "../utils/opened-apps-storage";

// Saves the opened apps in the local storage every time they change, so they are restored on reload.
// The save (JSON.stringify + setItem) runs when the browser is idle, so it doesn't delay the next
// frame after a click. A change that comes before the save cancels it, so only the latest one is saved
export function usePersistOpenedApps(openedApps: OpenedApps): void {
	useEffect(
		function persistOpenedApps() {
			return runWhenIdle(() => {
				saveOpenedApps(openedApps);
			});
		},
		[openedApps],
	);
}

// --- UTILS ---

// Safari doesn't support `requestIdleCallback`, so it falls back to a timeout
function runWhenIdle(callback: () => void): () => void {
	if (typeof window.requestIdleCallback === "function") {
		const id = window.requestIdleCallback(callback, { timeout: SAVE_TIMEOUT_MS });
		return (): void => window.cancelIdleCallback(id);
	}

	const id = window.setTimeout(callback, 0);
	return (): void => window.clearTimeout(id);
}

// --- CONSTANTS ---

// The save runs at most this long after the change, even if the browser is never idle
const SAVE_TIMEOUT_MS = 1000;
