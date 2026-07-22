"use client";

import type { JSX } from "react";
import { Toaster } from "sonner";

import cn from "~/lib/cn";

import StepRenderer from "./components/step-renderer";
import FormProvider from "./context/form.context";
import { useIsHydrated } from "./hooks/use-is-hydrated";

function FormPage(): JSX.Element | null {
	// --- HOOKS ---
	const isHydrated = useIsHydrated();

	// --- STYLES ---
	const classes = {
		main: cn("flex min-h-screen items-start justify-center bg-neutral-100 p-6 md:items-center"),
		container: cn("w-full max-w-md"),
	};

	// The form state is restored from localStorage on mount, so wait for
	// hydration before rendering to avoid a server/client markup mismatch.
	if (!isHydrated) return null;

	return (
		<main className={classes.main}>
			<div className={classes.container}>
				<FormProvider>
					<StepRenderer />
				</FormProvider>
			</div>
			<Toaster
				position="top-center"
				richColors
			/>
		</main>
	);
}

export default FormPage;
