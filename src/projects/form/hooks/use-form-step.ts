import { useMemo } from "react";
import { useSelector, useForm as useTSFForm } from "@tanstack/react-form";
import { useForm as useRHFForm } from "react-hook-form";
import type { DefaultValues } from "react-hook-form";
import { toast } from "sonner";

import { useMultiStepForm } from "../context/form.hook";
import { clearPersistedInputs, parseForm } from "../utils/form";
import type { FormInputName, FormValues, StepFormReturn } from "../utils/types";
import { usePersistInputs } from "./use-persist-inputs";

type UseFormStepParams<K extends FormInputName> = {
	inputNames: readonly K[];

	// When true, the whole form is parsed before moving on; the user stays on
	// the step (and sees a toast) if any value is invalid.
	isFinalStep?: boolean;
};

/**
 * Wires a `react-hook-form` step into the multi-step form: restores its default
 * values, persists every input as a draft, and on a valid submit saves the
 * values and moves to the next step.
 */
export function useRHFStep<K extends FormInputName>(
	params: UseFormStepParams<K>,
): StepFormReturn<Pick<FormValues, K>> {
	// --- HOOKS ---
	const { defaultValues, completeStep } = useFormStep(params);
	const form = useRHFForm<Pick<FormValues, K>, unknown, Pick<FormValues, K>>({
		mode: "onChange",
		// A complete `Pick<FormValues, K>` is a valid `DefaultValues` (a deep partial
		// of it), but TypeScript can't prove that while `K` is still generic.
		defaultValues: defaultValues as DefaultValues<Pick<FormValues, K>>,
	});

	// --- HANDLERS ---
	const submitForm = form.handleSubmit(completeStep);

	function onSubmit(event?: React.BaseSyntheticEvent): void {
		void submitForm(event);
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInputs(formValues);

	return { ...form, formValues, onSubmit };
}

/** Same as `useRHFStep`, for a TanStack Form step. */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
export function useTSFStep<K extends FormInputName>(params: UseFormStepParams<K>) {
	// --- HOOKS ---
	const { defaultValues, completeStep } = useFormStep(params);
	const form = useTSFForm({
		defaultValues,
		onSubmit: ({ value }) => completeStep(value),
	});

	// --- HANDLERS ---
	function onSubmit(event?: React.SubmitEvent): void {
		event?.preventDefault();
		event?.stopPropagation();
		void form.handleSubmit();
	}

	// --- COMPUTED STATES ---
	const formValues = useSelector(form.store, (state) => state.values);

	// --- EFFECTS ---
	usePersistInputs(formValues);

	return { form, formValues, onSubmit };
}

// --- SHARED ---

type UseFormStepReturn<K extends FormInputName> = {
	defaultValues: Pick<FormValues, K>;
	completeStep: (values: Pick<FormValues, K>) => void;
};

function useFormStep<K extends FormInputName>({
	inputNames,
	isFinalStep = false,
}: UseFormStepParams<K>): UseFormStepReturn<K> {
	// --- HOOKS ---
	const { formValues, scope, updateFormValues, goToNextStep, getDefaultValues } = useMultiStepForm();
	const defaultValues = useMemo(() => getDefaultValues(inputNames), [getDefaultValues, inputNames]);

	// --- UTILS ---
	function completeStep(values: Pick<FormValues, K>): void {
		updateFormValues(values);

		if (isFinalStep) {
			const result = parseForm({ ...formValues, ...values });

			if (result.error) {
				const message = result.error.issues.map((issue) => issue.message).join("\n");
				toast.error(message || "Please complete all fields correctly");
				return;
			}
		}

		clearPersistedInputs(scope, inputNames);
		goToNextStep();
	}

	return { defaultValues, completeStep };
}
