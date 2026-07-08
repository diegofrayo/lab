"use client";

import { useFormContext } from "../context/form.hook";

export function useFormNavigation(): UseFormNavigationReturn {
	const { currentStep, totalSteps, setCurrentStep } = useFormContext();

	const isFirstStep = currentStep <= 1;
	const isLastStep = currentStep >= totalSteps;

	function goToNextStep(): void {
		setCurrentStep((step: number) => Math.min(step + 1, totalSteps));
	}

	function goToPreviousStep(): void {
		setCurrentStep((step: number) => Math.max(step - 1, 1));
	}

	return { currentStep, totalSteps, isFirstStep, isLastStep, goToNextStep, goToPreviousStep };
}

// --- TYPES ---

type UseFormNavigationReturn = {
	currentStep: number;
	totalSteps: number;
	isFirstStep: boolean;
	isLastStep: boolean;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
};
