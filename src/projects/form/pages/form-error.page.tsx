"use client";

import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import Button from "../components/primitive/button";
import { clearPersistedForm, COLOMBIA_STORAGE_KEY } from "../utils/form";
import type { FormScope } from "../utils/types";

type FormErrorPageProps = {
	error: Error & { digest?: string };

	// Event handlers — at the end
	retry: () => void;
};

/**
 * Fallback for any error thrown while rendering a form route. The most likely
 * cause is a corrupted value in `localStorage`, so besides retrying, the user
 * can wipe the saved form and start over.
 */
function FormErrorPage({ error, retry }: FormErrorPageProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		main: cn("flex min-h-screen items-start justify-center bg-neutral-100 p-6 md:items-center"),
		card: cn(
			"flex w-full max-w-md flex-col gap-5 border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]",
		),
		title: cn("text-xl font-bold text-black"),
		message: cn(
			"overflow-x-auto border-2 border-black bg-neutral-100 p-3 font-mono text-xs whitespace-pre-wrap",
		),
		actions: cn("flex items-center justify-between gap-3"),
	};

	// --- HANDLERS ---
	function handleRetryClick(): void {
		retry();
	}

	function handleResetClick(): void {
		FORM_SCOPES.forEach(clearPersistedForm);
		window.localStorage.removeItem(COLOMBIA_STORAGE_KEY);
		window.location.reload();
	}

	return (
		<main className={classes.main}>
			<section
				role="alert"
				className={classes.card}
			>
				<h1 className={classes.title}>Something went wrong</h1>
				<p className={classes.message}>{error.message}</p>
				<div className={classes.actions}>
					<Button onClick={handleRetryClick}>Try again</Button>
					<Button onClick={handleResetClick}>Reset saved form</Button>
				</div>
			</section>
		</main>
	);
}

export default FormErrorPage;

const FORM_SCOPES: FormScope[] = ["rhf", "tsf"];
