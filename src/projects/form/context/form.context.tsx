"use client";

import { createContext, useState, type ReactNode } from "react";
import type { Dispatch, JSX, SetStateAction } from "react";

export const FormContext = createContext<FormContextValue | null>(null);

const TOTAL_STEPS = 4;

type FormProviderProps = {
	children: ReactNode;
};

export function FormProvider({ children }: FormProviderProps): JSX.Element {
	// --- STATES & REFS ---
	const [currentStep, setCurrentStep] = useState(1);

	return (
		<FormContext.Provider value={{ currentStep, totalSteps: TOTAL_STEPS, setCurrentStep }}>
			{children}
		</FormContext.Provider>
	);
}

// --- TYPES ---

export type FormContextValue = {
	currentStep: number;
	totalSteps: number;
	setCurrentStep: Dispatch<SetStateAction<number>>;
};
