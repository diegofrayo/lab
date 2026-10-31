import type { SocketStatus } from "../performance.types";

export const SOCKET_STATUS_LABELS: Record<SocketStatus, string> = {
	CONNECTING: "Connecting…",
	LIVE: "Live",
	RECONNECTING: "Reconnecting…",
};
