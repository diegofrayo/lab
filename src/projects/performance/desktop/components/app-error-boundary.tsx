"use client";

import { Component, useState, type ErrorInfo, type JSX, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import cn from "~/lib/cn";

type AppErrorBoundaryProps = {
	appName: string;
	children: ReactNode;
	onClose: () => void;
};

/**
 * Keeps an app that throws inside its own window, so the rest of the desktop keeps working.
 * Reloading remounts the boundary (and the app) with a new key, which also clears the error.
 */
function AppErrorBoundary({ appName, children, onClose }: AppErrorBoundaryProps): JSX.Element {
	// --- STATES & REFS ---
	const [resetKey, setResetKey] = useState(0);

	// --- HANDLERS ---
	function handleReloadClick(): void {
		setResetKey((prev) => prev + 1);
	}

	return (
		<ErrorBoundary
			key={resetKey}
			fallback={
				<AppCrashed
					appName={appName}
					onCloseClick={onClose}
					onReloadClick={handleReloadClick}
				/>
			}
		>
			{children}
		</ErrorBoundary>
	);
}

export default AppErrorBoundary;

// --- COMPONENTS ---

type ErrorBoundaryProps = {
	children: ReactNode;
	fallback: ReactNode;
};

type ErrorBoundaryState = {
	hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	override state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("[app-error-boundary] App crashed:", error, errorInfo.componentStack);
	}

	override render(): ReactNode {
		if (this.state.hasError) return this.props.fallback;

		return this.props.children;
	}
}

type AppCrashedProps = {
	appName: string;
	onCloseClick: () => void;
	onReloadClick: () => void;
};

function AppCrashed({ appName, onCloseClick, onReloadClick }: AppCrashedProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		container: cn("flex h-full flex-col items-center justify-center gap-3 text-center"),
		icon: cn("h-8 w-8 text-red-500"),
		title: cn("text-sm font-medium text-gray-800"),
		description: cn("text-xs text-gray-500"),
		actions: cn("flex gap-2"),
		btnReload: cn(
			"cursor-pointer rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
		btnClose: cn(
			"cursor-pointer rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
		),
	};

	return (
		<section
			className={classes.container}
			role="alert"
		>
			<TriangleAlert
				className={classes.icon}
				aria-hidden
			/>
			<h2 className={classes.title}>{appName} crashed</h2>
			<p className={classes.description}>Reload the app to try again, or close its window.</p>
			<div className={classes.actions}>
				<button
					className={classes.btnReload}
					onClick={onReloadClick}
				>
					Reload app
				</button>
				<button
					className={classes.btnClose}
					onClick={onCloseClick}
				>
					Close
				</button>
			</div>
		</section>
	);
}
