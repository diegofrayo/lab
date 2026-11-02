"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import type { OpenedApp } from "../desktop.types";

type WindowIconProps = {
	openedApp: OpenedApp;
};

function WindowIcon({ openedApp }: WindowIconProps): JSX.Element {
	// --- COMPUTED STATES ---
	const iconUrl = openedApp.appConfig.getWindowIconUrl?.(openedApp.params);

	if (iconUrl) {
		return (
			<img
				className={styles.image}
				src={iconUrl}
				alt=""
			/>
		);
	}

	return <span className={styles.emoji}>{openedApp.appConfig.icon}</span>;
}

// --- STYLES ---

const styles = {
	emoji: cn("text-base"),
	image: cn("h-5 w-5 shrink-0 rounded-sm object-cover"),
};

export default WindowIcon;
