"use client";

import { useEffect, useState } from "react";

export function useIsHydrated(): boolean {
	// --- STATES & REFS ---
	const [isHydrated, setIsHydrated] = useState(false);

	// --- EFFECTS ---
	useEffect(() => {
		// eslint-disable-next-line
		setIsHydrated(true);
	}, []);

	return isHydrated;
}
