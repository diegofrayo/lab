"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../hooks/use-form-navigation";
import Button from "./primitive/button";

type FormNavigationButtonsProps = {
	isCurrentFormValid: boolean;
};

function FormNavigationButtons({ isCurrentFormValid }: FormNavigationButtonsProps): JSX.Element {
	// --- HOOKS ---
	const { isPreviousStepEnabled, goToPreviousStep, isLastStep } = useFormNavigation();

	// --- COMPUTED STATES ---
	const isNextStepEnabled = isCurrentFormValid && !isLastStep;

	// --- STYLES ---
	const classes = {
		actions: cn("mt-8 flex justify-between gap-3"),
	};

	return (
		<nav className={classes.actions}>
			<Button
				disabled={!isPreviousStepEnabled}
				onClick={goToPreviousStep}
			>
				Previous
			</Button>
			<Button
				type="submit"
				disabled={!isNextStepEnabled}
			>
				Next
			</Button>
		</nav>
	);
}

export default FormNavigationButtons;
