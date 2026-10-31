"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { clearOpenedApps } from "./desktop";

type PerformanceErrorPageProps = {
	error: Error & { digest?: string };

	// Event handlers — at the end
	retry: () => void;
};

/**
 * Fallback for any error thrown outside the windows (each app has its own boundary). The opened
 * apps are restored from `localStorage`, so besides retrying, the user can start with an empty desktop.
 */
function PerformanceErrorPage({ error, retry }: PerformanceErrorPageProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		main: cn(
			"flex h-screen items-center justify-center bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 p-6",
		),
		card: cn("flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-2xl"),
		title: cn("text-lg font-semibold text-gray-800"),
		message: cn(
			"overflow-x-auto rounded bg-gray-100 p-3 font-mono text-xs whitespace-pre-wrap text-gray-700",
		),
		actions: cn("flex gap-2"),
		btnRetry: cn(
			"cursor-pointer rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
		btnReset: cn(
			"cursor-pointer rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
	};

	// --- HANDLERS ---
	function handleRetryClick(): void {
		retry();
	}

	function handleResetClick(): void {
		clearOpenedApps();
		window.location.reload();
	}

	return (
		<main className={classes.main}>
			<section
				role="alert"
				className={classes.card}
			>
				<h1 className={classes.title}>The desktop crashed</h1>
				<p className={classes.message}>{error.message}</p>
				<div className={classes.actions}>
					<button
						className={classes.btnRetry}
						onClick={handleRetryClick}
					>
						Try again
					</button>
					<button
						className={classes.btnReset}
						onClick={handleResetClick}
					>
						Close all windows
					</button>
				</div>
			</section>
		</main>
	);
}

export default PerformanceErrorPage;
