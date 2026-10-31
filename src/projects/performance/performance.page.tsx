"use client";

import type { JSX } from "react";
import { useIsClient } from "usehooks-ts";

import { Desktop, DesktopProvider } from "./desktop";

function PerformancePage(): JSX.Element | null {
	// --- HOOKS ---
	const isClient = useIsClient();

	// The opened apps are restored from localStorage, so wait for
	// hydration before rendering to avoid a server/client markup mismatch.
	if (!isClient) return null;

	return (
		<DesktopProvider>
			<Desktop />
		</DesktopProvider>
	);
}

export default PerformancePage;
