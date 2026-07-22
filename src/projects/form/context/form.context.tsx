"use client";

import { createContext, useCallback, useMemo } from "react";
import type { JSX, ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";

import { TOTAL_STEPS } from "../utils/types";
import type { FormValues, StepNumber } from "../utils/types";

// --- TYPES ---

export type FormContextValue = {
	formValues: Partial<FormValues>;
	currentStep: StepNumber;
	updateFormValues: (partial: Partial<FormValues>) => void;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
};

type FormProviderProps = {
	children: ReactNode;
};

// --- CONTEXT ---

export const FormContext = createContext<FormContextValue | null>(null);

function FormProvider({ children }: FormProviderProps): JSX.Element {
	// --- HOOKS ---
	const [formValues, setFormValues] = useLocalStorage<Partial<FormValues>>(STORAGE_KEYS.values, {});
	const [currentStep, setCurrentStep] = useLocalStorage<StepNumber>(STORAGE_KEYS.step, 1);

	// --- UTILS ---
	const updateFormValues = useCallback(
		function updateFormValues(partial: Partial<FormValues>) {
			setFormValues((prev) => ({ ...prev, ...partial }));
		},
		[setFormValues],
	);

	const goToNextStep = useCallback(
		function goToNextStep() {
			setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS) as StepNumber);
		},
		[setCurrentStep],
	);

	const goToPreviousStep = useCallback(
		function goToPreviousStep() {
			setCurrentStep((step) => Math.max(step - 1, 1) as StepNumber);
		},
		[setCurrentStep],
	);

	// --- COMPUTED STATES ---
	const value = useMemo<FormContextValue>(
		() => ({
			formValues,
			currentStep,
			updateFormValues,
			goToNextStep,
			goToPreviousStep,
		}),
		[formValues, currentStep, updateFormValues, goToNextStep, goToPreviousStep],
	);

	return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormProvider;

// --- CONSTANTS ---

const STORAGE_KEYS = {
	values: "form:values",
	step: "form:step",
};
