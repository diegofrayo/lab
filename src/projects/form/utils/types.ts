import type { BaseSyntheticEvent } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import type { formSchema } from "./form";

/** The complete set of values collected across every step. */
export type FormValues = z.infer<typeof formSchema>;

export type FormInputName = keyof FormValues;

/** The subset of values owned by step 1. */
export type Step1Values = Pick<FormValues, "name" | "email" | "username">;

/** Total number of steps in the form. */
export const TOTAL_STEPS = 4;

/** A valid step index (1-based). */
export type StepNumber = 1 | 2 | 3 | 4;

/**
 * What every `useStep<n>Form` hook returns: the react-hook-form instance plus a
 * ready-to-bind `onSubmit` handler.
 */
export type StepFormReturn<T extends FieldValues = FieldValues> = UseFormReturn<T> & {
	onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
	formValues: T;
};

export type FieldStatus = "NEUTRAL" | "VALID" | "INVALID";
