"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import type { OpenedApp } from "../desktop.types";

type WindowIconProps = {
	openedApp: OpenedApp;
};

function WindowIcon({ openedApp }: WindowIconProps): JSX.Element {
	// --- COMPUTED STATES ---
	const iconUrl = openedApp.appConfig.getWindowIconUrl?.(openedApp.params);

	// --- STYLES ---
	const classes = {
		emoji: cn("text-base"),
		image: cn("h-5 w-5 shrink-0 rounded-sm object-cover"),
	};

	if (iconUrl) {
		return (
			<img
				className={classes.image}
				src={iconUrl}
				alt=""
			/>
		);
	}

	return <span className={classes.emoji}>{openedApp.appConfig.icon}</span>;
}

export default WindowIcon;
