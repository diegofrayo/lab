"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import StepRenderer from "./components/step-renderer";
import { FormProvider } from "./context/form.context";
import { useFormNavigation } from "./hooks/use-form-navigation";
import { useIsHydrated } from "./hooks/use-is-hydrated";

function FormPage(): JSX.Element | null {
	// --- HOOKS ---
	const isHydrated = useIsHydrated();

	if (!isHydrated) {
		return null;
	}

	return (
		<FormProvider>
			<Content />
		</FormProvider>
	);
}

export default FormPage;

// --- COMPONENTS ---

function Content(): JSX.Element {
	// --- HOOKS ---
	const { currentStep, totalSteps } = useFormNavigation();

	// --- STYLES ---
	const classes = {
		form: cn("mx-auto flex max-w-md flex-col gap-6 p-6 pb-8"),
		header: cn(
			"inline-block self-start rounded-none border-2 border-black bg-yellow-300 px-3 py-1 text-sm font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_0_#000]",
		),
		content: cn(
			"min-h-24 rounded-none border-2 border-black bg-white p-4 text-black shadow-[4px_4px_0_0_#000]",
		),
	};

	return (
		<section className={classes.form}>
			<header className={classes.header}>{`Step ${currentStep} of ${totalSteps}`}</header>
			<div className={classes.content}>
				<StepRenderer step={currentStep} />
			</div>
		</section>
	);
}
