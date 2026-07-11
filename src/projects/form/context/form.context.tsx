"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { Dispatch, JSX, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

export const FormContext = createContext<FormContextValue | null>(null);

type FormProviderProps = {
	children: ReactNode;
};

export function FormProvider({ children }: FormProviderProps): JSX.Element {
	// --- STATES & REFS ---
	const [formValues, setFormValues] = useLocalStorage<FormValues>(
		"form-values",
		{
			name: "",
			lastName: "",
			username: "",
		},
		{ initializeWithValue: false },
	);
	const [currentStep, setCurrentStep] = useLocalStorage<number>("current-step", 1, {
		initializeWithValue: false,
	});

	// --- COMPUTED STATES ---
	const providerValue = useMemo<FormContextValue>(
		function buildProviderValue() {
			return {
				totalSteps: 4,
				currentStep,
				setCurrentStep,
				formValues,
				setFormValues,
			};
		},
		[currentStep, formValues, setFormValues, setCurrentStep],
	);

	return <FormContext.Provider value={providerValue}>{children}</FormContext.Provider>;
}

// --- TYPES ---

export type FormContextValue = {
	totalSteps: number;
	currentStep: number;
	setCurrentStep: Dispatch<SetStateAction<number>>;
	formValues: FormValues;
	setFormValues: Dispatch<SetStateAction<FormValues>>;
};

export type FormValues = {
	name: string;
	lastName: string;
	username: string;
};
