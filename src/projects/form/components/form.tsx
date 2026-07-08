"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../hooks/use-form-navigation";
import StepRenderer from "./step-renderer";

function Form(): JSX.Element {
	// --- HOOKS ---
	const { currentStep, totalSteps, isFirstStep, isLastStep, goToNextStep, goToPreviousStep } =
		useFormNavigation();

	// --- STYLES ---
	const classes = {
		form: cn("mx-auto flex max-w-md flex-col gap-6 p-6"),
		header: cn("text-sm text-gray-500"),
		content: cn("min-h-24 rounded border border-gray-200 p-4"),
		actions: cn("flex justify-between gap-3"),
		button: cn(
			"rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40",
		),
	};

	return (
		<section className={classes.form}>
			<header className={classes.header}>
				Step {currentStep} of {totalSteps}
			</header>

			<div className={classes.content}>
				<StepRenderer step={currentStep} />
			</div>

			<nav className={classes.actions}>
				<button
					type="button"
					className={classes.button}
					disabled={isFirstStep}
					onClick={goToPreviousStep}
				>
					Previous
				</button>
				<button
					type="button"
					className={classes.button}
					disabled={isLastStep}
					onClick={goToNextStep}
				>
					Next
				</button>
			</nav>
		</section>
	);
}

export default Form;
