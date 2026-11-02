"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import type { SocketStatus } from "../performance.types";

type SocketStatusBadgeProps = {
	status: SocketStatus;
};

function SocketStatusBadge({ status }: SocketStatusBadgeProps): JSX.Element {
	// --- STYLES ---
	const classes = getClasses({ status });

	return <span className={classes.badge}>{SOCKET_STATUS_LABELS[status]}</span>;
}

// --- STYLES ---

type GetClassesParams = {
	status: SocketStatus;
};

function getClasses({ status }: GetClassesParams) {
	const classes = {
		badge: cn(
			"rounded-full px-2 py-0.5 text-xs font-medium",
			status === "LIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600",
		),
	};

	return classes;
}

export default SocketStatusBadge;

// --- CONSTANTS ---

const SOCKET_STATUS_LABELS: Record<SocketStatus, string> = {
	CONNECTING: "Connecting…",
	LIVE: "Live",
	RECONNECTING: "Reconnecting…",
};
