"use client";

import { createContext, useCallback, useMemo } from "react";
import type { JSX, ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";

import { composeLocalStorageKeyForInput } from "../utils/form";
import { TOTAL_STEPS } from "../utils/types";
import type { FormInputName, FormValues, StepNumber } from "../utils/types";

// --- TYPES ---

export type FormContextValue = {
	formValues: Partial<FormValues>;
	currentStep: StepNumber;
	updateFormValues: (partial: Partial<FormValues>) => void;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	getDefaultValues: (keys: FormInputName[]) => Partial<FormValues>;
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

	const getDefaultValues = useCallback(
		function getDefaultValues(keys: (keyof FormValues)[]) {
			const values = keys.reduce((result, inputName) => {
				const lsValue = parseLocalStorageValue(inputName);

				return {
					...result,
					[inputName]: lsValue ?? formValues[inputName] ?? "",
				};
			}, {});

			console.log("getDefaultValues:", values);

			return values;
		},
		[formValues],
	);

	// --- COMPUTED STATES ---
	const value = useMemo<FormContextValue>(
		() => ({
			formValues,
			currentStep,
			updateFormValues,
			goToNextStep,
			goToPreviousStep,
			getDefaultValues,
		}),
		[formValues, currentStep, updateFormValues, goToNextStep, goToPreviousStep, getDefaultValues],
	);

	return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormProvider;

// --- CONSTANTS ---

const STORAGE_KEYS = {
	values: "form:values",
	step: "form:step",
};

// --- UTILS ---

function parseLocalStorageValue(inputName: FormInputName): string | boolean | null {
	const rawValue = window.localStorage.getItem(composeLocalStorageKeyForInput(inputName));
	if (rawValue === null) return rawValue;

	const value = inputName === "hasCollegeDegree" ? rawValue === "true" : rawValue;

	return value;
}
