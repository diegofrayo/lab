"use client";

import { useCallback } from "react";

import type { FormContextValue, FormValues } from "../context/form.context";
import { useFormContext } from "../context/form.hook";

export function useFormNavigation(): UseFormNavigationReturn {
	const { currentStep, totalSteps, setCurrentStep, formValues, setFormValues } = useFormContext();

	const isFirstStep = currentStep <= 1;
	const isLastStep = currentStep >= totalSteps;
	const isPreviousStepEnabled = !isFirstStep;

	// --- HANDLERS ---
	const goToNextStep: UseFormNavigationReturn["goToNextStep"] = useCallback(
		function goToNextStep() {
			setCurrentStep((step: number) => Math.min(step + 1, totalSteps));
		},
		[setCurrentStep, totalSteps],
	);

	const goToPreviousStep: UseFormNavigationReturn["goToPreviousStep"] = useCallback(
		function goToPreviousStep() {
			setCurrentStep((step: number) => Math.max(step - 1, 1));
		},
		[setCurrentStep],
	);

	const updateFormValues: UseFormNavigationReturn["updateFormValues"] = useCallback(
		function updateFormValues(newValues) {
			setFormValues((currentValues) => ({ ...currentValues, ...newValues }));
		},
		[setFormValues],
	);

	console.log("context", {
		currentStep,
		totalSteps,
		formValues,
		isLastStep,
		isPreviousStepEnabled,
	});

	return {
		currentStep,
		totalSteps,
		formValues,
		isLastStep,
		isPreviousStepEnabled,
		goToNextStep,
		goToPreviousStep,
		updateFormValues,
	};
}

// --- TYPES ---

type UseFormNavigationReturn = Pick<
	FormContextValue,
	"currentStep" | "totalSteps" | "formValues"
> & {
	isPreviousStepEnabled: boolean;
	isLastStep: boolean;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	updateFormValues: (formValues: Partial<FormValues>) => void;
};
