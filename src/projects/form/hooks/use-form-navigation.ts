"use client";

import { useCallback } from "react";

import type { FormContextValue } from "../context/form.context";
import { useFormContext } from "../context/form.hook";

export function useFormNavigation(): UseFormNavigationReturn {
	const {
		currentStep,
		totalSteps,
		setCurrentStep,
		isCurrentFormValid,
		setIsCurrentFormValid,
		formValues,
		updateFormValues,
	} = useFormContext();

	const isFirstStep = currentStep <= 1;
	const isLastStep = currentStep >= totalSteps;
	const isPreviousStepEnabled = !isFirstStep;
	const isNextStepEnabled = isCurrentFormValid && !isLastStep;

	const goToNextStep: UseFormNavigationReturn["goToNextStep"] = useCallback(
		function goToNextStep() {
			setCurrentStep((step: number) => Math.min(step + 1, totalSteps));
			setIsCurrentFormValid(false);
		},
		[setCurrentStep, setIsCurrentFormValid, totalSteps],
	);

	const goToPreviousStep: UseFormNavigationReturn["goToPreviousStep"] = useCallback(
		function goToPreviousStep() {
			setCurrentStep((step: number) => Math.max(step - 1, 1));
			setIsCurrentFormValid(false);
		},
		[setCurrentStep, setIsCurrentFormValid],
	);

	const syncCurrentFormValidity: UseFormNavigationReturn["syncCurrentFormValidity"] = useCallback(
		function syncCurrentFormValidity(isFormValid) {
			setIsCurrentFormValid(isFormValid);
		},
		[setIsCurrentFormValid],
	);

	return {
		currentStep,
		totalSteps,
		isLastStep,
		isPreviousStepEnabled,
		isNextStepEnabled,
		goToNextStep,
		goToPreviousStep,
		syncCurrentFormValidity,
		formValues,
		updateFormValues,
	};
}

// --- TYPES ---

type UseFormNavigationReturn = Pick<
	FormContextValue,
	"currentStep" | "totalSteps" | "formValues" | "updateFormValues"
> & {
	isPreviousStepEnabled: boolean;
	isNextStepEnabled: boolean;
	isLastStep: boolean;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	syncCurrentFormValidity: (isFormValid: boolean) => void;
};
