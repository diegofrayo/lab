"use client";

import type { JSX } from "react";
import { Toaster } from "sonner";
import { useIsClient } from "usehooks-ts";

import cn from "~/lib/cn";

import FormProvider from "../context/form.context";
import type { FormScope, StepNumber } from "../utils/types";
import StepRenderer from "./step-renderer";

type FormPageProps = {
	scope: FormScope;
	stepComponents: Record<StepNumber, () => JSX.Element>;
};

function FormPage({ stepComponents, scope }: FormPageProps): JSX.Element | null {
	// --- HOOKS ---
	const isClient = useIsClient();

	// --- STYLES ---
	const classes = {
		main: cn("flex min-h-screen items-start justify-center bg-neutral-100 p-6 md:items-center"),
		container: cn("w-full max-w-md"),
	};

	// The form state is restored from localStorage on mount, so wait for
	// hydration before rendering to avoid a server/client markup mismatch.
	if (!isClient) return null;

	return (
		<main className={classes.main}>
			<div className={classes.container}>
				<FormProvider scope={scope}>
					<StepRenderer stepComponents={stepComponents} />
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
