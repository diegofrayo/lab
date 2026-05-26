"use client";

import { useContext } from "react";

import { DesktopContext, type DesktopContextValue } from "./desktop.context";

export function useDesktop(): DesktopContextValue {
	const context = useContext(DesktopContext);
	if (!context) {
		throw new Error("useDesktop must be used within a DesktopProvider");
	}
	return context;
}
