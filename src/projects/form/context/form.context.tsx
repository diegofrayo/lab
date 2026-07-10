"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";
import type { Dispatch, JSX, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

export const FormContext = createContext<FormContextValue | null>(null);

const TOTAL_STEPS = 4;

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
	const [isCurrentFormValid, setIsCurrentFormValid] = useState(false);

	// --- HANDLERS ---
	const updateFormValues: FormContextValue["updateFormValues"] = useCallback(
		function updateFormValues(newValues) {
			setFormValues((currentValues) => ({ ...currentValues, ...newValues }));
		},
		[setFormValues],
	);

	return (
		<FormContext.Provider
			value={{
				currentStep,
				totalSteps: TOTAL_STEPS,
				setCurrentStep,
				isCurrentFormValid,
				setIsCurrentFormValid,
				formValues,
				updateFormValues,
			}}
		>
			{children}
		</FormContext.Provider>
	);
}

// --- TYPES ---

export type FormContextValue = {
	currentStep: number;
	totalSteps: number;
	setCurrentStep: Dispatch<SetStateAction<number>>;
	isCurrentFormValid: boolean;
	setIsCurrentFormValid: Dispatch<SetStateAction<boolean>>;
	formValues: FormValues;
	updateFormValues: (newValues: Partial<FormValues>) => void;
};

export type FormValues = {
	name: string;
	lastName: string;
	username: string;
};
