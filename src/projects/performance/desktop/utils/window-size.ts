import type { AppConfig } from "../desktop.types";

type WindowSize = {
	width: number;
	height: number;
};

export function getMinWindowSize(appConfig: AppConfig): WindowSize {
	return appConfig.minWindowSize ?? DEFAULT_MIN_WINDOW_SIZE;
}

// The configured size is used only when it's not smaller than the min size
export function getInitialWindowSize(appConfig: AppConfig): WindowSize {
	const minWindowSize = getMinWindowSize(appConfig);

	return {
		width: Math.max(appConfig.windowConfig?.width ?? DEFAULT_WINDOW_SIZE.width, minWindowSize.width),
		height: Math.max(appConfig.windowConfig?.height ?? DEFAULT_WINDOW_SIZE.height, minWindowSize.height),
	};
}

// --- CONSTANTS ---

const DEFAULT_MIN_WINDOW_SIZE: WindowSize = { width: 768, height: 768 };
const DEFAULT_WINDOW_SIZE: WindowSize = { width: 600, height: 420 };
