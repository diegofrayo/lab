"use client";

import { useMemo, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";

import Form from "../../components/form";
import Checkbox from "../../components/primitive/checkbox";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useFormNavigation } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	clearPersistedInputs,
	createTSFValidatorFromCustomValidation,
	createTSFValidatorFromInputShape,
	CustomValidations,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import type { FormInputName, Step3Values } from "../../utils/types";

function Step3(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useStep3Form();
	const hasCollegeDegree = useSelector(form.store, (state) => Boolean(state.values.hasCollegeDegree));

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body className="min-h-32">
				<form.Field
					name="hasCollegeDegree"
					validators={ValidationRules.hasCollegeDegree}
				>
					{(field) => (
						<Form.Field className="flex w-fit flex-row items-center gap-2.5">
							<Checkbox
								id="hasCollegeDegree"
								checked={field.state.value}
								onCheckedChange={(checked) => {
									field.handleChange(checked);

									if (!checked) form.setFieldValue("collegeName", "");
								}}
							/>
							<Label
								htmlFor="hasCollegeDegree"
								className="cursor-pointer"
							>
								I have a college degree
							</Label>
						</Form.Field>
					)}
				</form.Field>

				{hasCollegeDegree && (
					<form.Field
						name="collegeName"
						validators={ValidationRules.collegeName}
					>
						{(field) => {
							const collegeNameStatus = getFieldStatus({
								hasError: field.state.meta.errors.length > 0,
								isTouched: field.state.meta.isTouched,
								hasValue: Boolean(field.state.value),
							});

							return (
								<Form.Field>
									<Label
										htmlFor="collegeName"
										data-state={collegeNameStatus}
									>
										College name
									</Label>
									<Input
										id="collegeName"
										aria-describedby={getFieldMessageId("collegeName")}
										name={field.name}
										data-state={collegeNameStatus}
										aria-invalid={collegeNameStatus === "invalid"}
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									<Form.FieldMessage
										inputId="collegeName"
										status={collegeNameStatus}
									>
										{field.state.meta.errors[0]}
									</Form.FieldMessage>
								</Form.Field>
							);
						}}
					</form.Field>
				)}
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step3;

// --- CONTROLLER ---

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
function useStep3Form() {
	// --- HOOKS ---
	const { scope, updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["hasCollegeDegree", "collegeName"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues<Step3Values>(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		onSubmit: ({ value }) => {
			updateFormValues(value);
			clearPersistedInputs(scope, FORM_INPUTS_NAME);
			goToNextStep();
		},
	});

	// --- HANDLERS ---
	function onSubmit(event?: React.SubmitEvent): void {
		event?.preventDefault();
		event?.stopPropagation();
		form.handleSubmit();
	}

	// --- COMPUTED STATES ---
	const formValues = useSelector(form.store, (state) => state.values);

	// --- EFFECTS ---
	usePersistInput("hasCollegeDegree", formValues.hasCollegeDegree);
	usePersistInput("collegeName", formValues.collegeName);

	return { form, onSubmit };
}

// --- VALIDATION RULES ---

const ValidationRules = {
	hasCollegeDegree: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.hasCollegeDegree),
	},
	collegeName: {
		onChangeListenTo: ["hasCollegeDegree"] as (keyof Step3Values)[],
		onChange: createTSFValidatorFromCustomValidation<Step3Values["collegeName"], Step3Values>(
			CustomValidations.step3.collegeName,
		),
	},
};
