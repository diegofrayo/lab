"use client";

import { useMemo, type JSX } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";

import Form from "../components/form";
import Checkbox from "../components/primitive/checkbox";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../context/form.hook";
import { useFormSubmitted } from "../hooks/use-form-submitted";
import { usePersistInput } from "../hooks/use-persist-input";
import { formSchema, getFieldStatus, validateField } from "../utils/form";
import type { FormInputName, Step3Values, StepFormReturn } from "../utils/types";

function Step3(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		register,
		formValues,
		formState: { errors, touchedFields, dirtyFields },
		handleHasCollegeDegreeChange,
		onSubmit,
	} = useStep3Form();

	// --- COMPUTED STATES ---
	const hasCollegeDegree = Boolean(formValues.hasCollegeDegree);
	const collegeNameStatus = getFieldStatus({
		hasError: Boolean(errors.collegeName),
		isTouched: Boolean(dirtyFields.collegeName) || Boolean(touchedFields.collegeName),
		hasValue: Boolean(formValues.collegeName),
	});

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body className="min-h-32">
				<Form.Field className="flex w-fit flex-row items-center gap-2.5">
					<Controller
						name="hasCollegeDegree"
						control={control}
						render={({ field }) => {
							function handleCheckedChange(checked: boolean): void {
								field.onChange(checked);
								handleHasCollegeDegreeChange(checked);
							}

							return (
								<Checkbox
									id="hasCollegeDegree"
									checked={field.value}
									ref={field.ref}
									onCheckedChange={handleCheckedChange}
								/>
							);
						}}
					/>
					<Label
						htmlFor="hasCollegeDegree"
						className="cursor-pointer"
					>
						I have a college degree
					</Label>
				</Form.Field>

				{hasCollegeDegree && (
					<Form.Field>
						<Label
							htmlFor="collegeName"
							data-state={collegeNameStatus}
						>
							College name
						</Label>
						<Input
							id="collegeName"
							data-state={collegeNameStatus}
							aria-invalid={collegeNameStatus === "invalid"}
							{...register("collegeName", COLLEGE_NAME_RULES)}
						/>
						<Form.FieldMessage status={collegeNameStatus}>
							{errors.collegeName?.message}
						</Form.FieldMessage>
					</Form.Field>
				)}
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step3;

// --- CONTROLLER ---

type UseStep3FormReturn = StepFormReturn<Step3Values> & {
	control: Control<Step3Values>;
	handleHasCollegeDegreeChange: (checked: boolean) => void;
};

function useStep3Form(): UseStep3FormReturn {
	// --- HOOKS ---
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["hasCollegeDegree", "collegeName"], []);
	const DEFAULT_VALUES = useMemo(() => getDefaultValues(FORM_INPUTS_NAME), [FORM_INPUTS_NAME]);
	const form = useForm<Step3Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
	});

	function handleHasCollegeDegreeChange(checked: boolean): void {
		if (checked) {
			form.trigger("collegeName");
			return;
		}

		form.setValue("collegeName", "", { shouldValidate: true });
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("hasCollegeDegree", String(formValues.hasCollegeDegree));
	usePersistInput("collegeName", formValues.collegeName ?? "");
	useFormSubmitted(FORM_INPUTS_NAME, form.formState.isSubmitSuccessful, goToNextStep);

	return { ...form, formValues, onSubmit, handleHasCollegeDegreeChange };
}

// --- VALIDATION RULES ---

const COLLEGE_NAME_RULES = {
	validate: {
		schema: (value: string | undefined, formValues: Step3Values): string | true => {
			return formValues.hasCollegeDegree
				? validateField(formSchema.shape.collegeName, value)
				: true;
		},
	},
};
