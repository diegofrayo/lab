"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

type WindowLoaderProps = {
	text: string;
};

function WindowLoader({ text }: WindowLoaderProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		backdrop: cn("absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-sm"),
		content: cn("flex flex-col items-center gap-3"),
		spinner: cn("h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"),
		text: cn("text-sm font-medium text-gray-700"),
	};

	return (
		<div
			className={classes.backdrop}
			role="status"
			aria-live="polite"
		>
			<div className={classes.content}>
				<span className={classes.spinner} />
				<span className={classes.text}>{text}</span>
			</div>
		</div>
	);
}

export default WindowLoader;
