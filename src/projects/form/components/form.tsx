"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../hooks/use-form-navigation";
import { useIsHydrated } from "../hooks/use-is-hydrated";
import StepRenderer from "./step-renderer";

function Form(): JSX.Element {
	// --- HOOKS ---
	const { currentStep, totalSteps } = useFormNavigation();
	const isHydrated = useIsHydrated();

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
			<header className={classes.header}>
				{isHydrated ? `Step ${currentStep} of ${totalSteps}` : `…`}
			</header>

			<div className={classes.content}>
				{/*
				 * Wait until localStorage has hydrated before rendering a step,
				 * otherwise the initial default (Step1) would flash before the
				 * stored step renders.
				 */}
				{isHydrated ? <StepRenderer step={currentStep} /> : null}
			</div>
		</section>
	);
}

export default Form;
