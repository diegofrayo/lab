"use client";

import { createContext, useCallback, useMemo } from "react";
import type { JSX, ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";

import { clearPersistedForm, composeLocalStorageKeyForInput } from "../utils/form";
import { STEPS } from "../utils/types";
import type { FormInputName, FormScope, FormValues, StepNumber } from "../utils/types";

// --- TYPES ---

export type FormContextValue = {
	formValues: Partial<FormValues>;
	currentStep: StepNumber;
	scope: FormScope;
	updateFormValues: (partial: Partial<FormValues>) => void;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	getDefaultValues: <K extends FormInputName>(keys: readonly K[]) => Pick<FormValues, K>;
	resetForm: () => void;
};

type FormProviderProps = {
	children: ReactNode;
	scope: FormScope;
};

// --- CONTEXT ---

export const FormContext = createContext<FormContextValue | null>(null);

function FormProvider({ children, scope }: FormProviderProps): JSX.Element {
	// --- CONSTANTS ---
	const STORAGE_KEYS = {
		values: `${scope}:form:values`,
		step: `${scope}:form:step`,
	};

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
			setCurrentStep((step) => getSiblingStep(step, 1));
		},
		[setCurrentStep],
	);

	const goToPreviousStep = useCallback(
		function goToPreviousStep() {
			setCurrentStep((step) => getSiblingStep(step, -1));
		},
		[setCurrentStep],
	);

	const getDefaultValues = useCallback(
		function getDefaultValues<K extends FormInputName>(keys: readonly K[]) {
			return keys.reduce(
				(result, inputName) => {
					const lsValue = parseLocalStorageValue(scope, inputName);

					return {
						...result,
						[inputName]: lsValue ?? formValues[inputName] ?? DEFAULT_VALUES[inputName],
					};
				},
				{} as Pick<FormValues, K>,
			);
		},
		[formValues, scope],
	);

	const resetForm = useCallback(
		function resetForm() {
			clearPersistedForm(scope);
			window.location.reload();
		},
		[scope],
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
			resetForm,
			scope,
		}),
		[
			formValues,
			currentStep,
			updateFormValues,
			goToNextStep,
			goToPreviousStep,
			getDefaultValues,
			resetForm,
			scope,
		],
	);

	return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export default FormProvider;

const DEFAULT_VALUES = {
	name: "",
	email: "",
	username: "",
	state: "",
	city: "",
	hasCollegeDegree: false,
	collegeName: "",
	startDate: "",
	stillStudying: undefined,
	endDate: "",
};

// --- UTILS ---

function parseLocalStorageValue<K extends FormInputName>(
	scope: FormScope,
	inputName: K,
): FormValues[K] | null {
	const rawValue = window.localStorage.getItem(composeLocalStorageKeyForInput(scope, inputName));
	if (rawValue === null) return rawValue;

	try {
		return JSON.parse(rawValue) as FormValues[K];
	} catch {
		return null;
	}
}

/** Returns the step `offset` positions away, staying on `step` at either end of the form. */
function getSiblingStep(step: StepNumber, offset: 1 | -1): StepNumber {
	return STEPS[STEPS.indexOf(step) + offset] ?? step;
}
