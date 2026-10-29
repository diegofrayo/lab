import type { BaseSyntheticEvent } from "react";
import type {
	DeepKeys,
	DeepValue,
	FieldAsyncValidateOrFn,
	FieldValidateOrFn,
	FieldValidators,
} from "@tanstack/react-form";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import type { formSchema } from "./form";

/** The complete set of values collected across every step. */
export type FormValues = z.infer<typeof formSchema>;

export type FormInputName = keyof FormValues;

/** The inputs owned by each step, in render order. `StepNValues` derives from them. */
export const STEP_1_INPUT_NAMES = ["name", "email", "username"] as const satisfies FormInputName[];
export const STEP_2_INPUT_NAMES = ["state", "city"] as const satisfies FormInputName[];
export const STEP_3_INPUT_NAMES = ["hasCollegeDegree", "collegeName"] as const satisfies FormInputName[];
export const STEP_4_INPUT_NAMES = [
	"startDate",
	"stillStudying",
	"endDate",
] as const satisfies FormInputName[];

/** The subset of values owned by step 1. */
export type Step1Values = Pick<FormValues, (typeof STEP_1_INPUT_NAMES)[number]>;

/** The subset of values owned by step 2. */
export type Step2Values = Pick<FormValues, (typeof STEP_2_INPUT_NAMES)[number]>;

/** The subset of values owned by step 3. */
export type Step3Values = Pick<FormValues, (typeof STEP_3_INPUT_NAMES)[number]>;

/** The subset of values owned by step 4. */
export type Step4Values = Pick<FormValues, (typeof STEP_4_INPUT_NAMES)[number]>;

/** Every step of the form, in order. `StepNumber` and `TOTAL_STEPS` derive from it. */
export const STEPS = [1, 2, 3, 4, 5] as const;

/** A valid step index (1-based). */
export type StepNumber = (typeof STEPS)[number];

/** Total number of steps in the form. */
export const TOTAL_STEPS = STEPS.length;

/**
 * What `useRHFStep` returns: the react-hook-form instance, the watched values and
 * a ready-to-bind `onSubmit` handler.
 */
export type StepFormReturn<T extends FieldValues = FieldValues> = UseFormReturn<T> & {
	onSubmit: (event?: BaseSyntheticEvent) => void;
	formValues: T;
};

export type FieldStatus = "neutral" | "valid" | "invalid";

export type FormScope = "rhf" | "tsf";

type TSFSyncValidator<T, K extends DeepKeys<T>> = undefined | FieldValidateOrFn<T, K, DeepValue<T, K>>;
type TSFAsyncValidator<T, K extends DeepKeys<T>> =
	undefined | FieldAsyncValidateOrFn<T, K, DeepValue<T, K>>;

/**
 * The `validators` of every TanStack Form field in a step, keyed by field name.
 * Use it with `satisfies` so a misspelled option (e.g. `onChangeAsyncDebounce`) fails to compile.
 */
export type TSFValidationRules<T> = {
	[K in keyof T & DeepKeys<T>]?: FieldValidators<
		T,
		K,
		DeepValue<T, K>,
		TSFSyncValidator<T, K>,
		TSFSyncValidator<T, K>,
		TSFAsyncValidator<T, K>,
		TSFSyncValidator<T, K>,
		TSFAsyncValidator<T, K>,
		TSFSyncValidator<T, K>,
		TSFAsyncValidator<T, K>,
		TSFSyncValidator<T, K>,
		TSFAsyncValidator<T, K>
	>;
};
