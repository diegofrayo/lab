"use client";

import { useMemo, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";
import { toast } from "sonner";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import RadioGroup from "../../components/primitive/radio-group";
import type { RadioGroupOption } from "../../components/primitive/radio-group";
import { useMultiStepForm } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	clearPersistedInputs,
	createTSFValidatorFromCustomValidation,
	createTSFValidatorFromInputShape,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getFieldMessageId,
	getFieldStatus,
	parseForm,
	toHtmlDateValue,
} from "../../utils/form";
import type { Step4Values, TSFValidationRules } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useStep4Form();
	const stillStudying = useSelector(form.store, (state) => state.values.stillStudying);

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="startDate"
					validators={ValidationRules.startDate}
				>
					{(field) => {
						const startDateStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
						});

						return (
							<Form.Field>
								<Label
									htmlFor="startDate"
									data-state={startDateStatus}
								>
									Start date
								</Label>
								<Input
									id="startDate"
									aria-describedby={getFieldMessageId("startDate")}
									type="date"
									data-state={startDateStatus}
									aria-invalid={startDateStatus === "invalid"}
									name={field.name}
									value={toHtmlDateValue(field.state.value)}
									placeholder="yyyy/mm/dd"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
								/>
								<Form.FieldMessage
									inputId="startDate"
									status={startDateStatus}
								>
									{field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
				</form.Field>

				<form.Field
					name="stillStudying"
					validators={ValidationRules.stillStudying}
				>
					{(field) => {
						const stillStudyingStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: field.state.value !== undefined,
						});

						function handleStillStudyingChange(value: boolean): void {
							field.handleChange(value);

							if (value) form.setFieldValue("endDate", "");
						}

						return (
							<Form.Field>
								<Label
									id="stillStudyingLabel"
									data-state={stillStudyingStatus}
								>
									Still studying?
								</Label>
								<RadioGroup
									aria-labelledby="stillStudyingLabel"
									name={field.name}
									data-state={stillStudyingStatus}
									items={STILL_STUDYING_OPTIONS}
									value={field.state.value ?? null}
									onBlur={field.handleBlur}
									onValueChange={handleStillStudyingChange}
								/>
							</Form.Field>
						);
					}}
				</form.Field>

				{stillStudying === false && (
					<form.Field
						name="endDate"
						validators={ValidationRules.endDate}
					>
						{(field) => {
							const endDateStatus = getFieldStatus({
								hasError: field.state.meta.errors.length > 0,
								isTouched: field.state.meta.isTouched,
								hasValue: Boolean(field.state.value),
							});

							return (
								<Form.Field>
									<Label
										htmlFor="endDate"
										data-state={endDateStatus}
									>
										End date
									</Label>
									<Input
										id="endDate"
										aria-describedby={getFieldMessageId("endDate")}
										type="date"
										data-state={endDateStatus}
										aria-invalid={endDateStatus === "invalid"}
										name={field.name}
										placeholder="yyyy/mm/dd"
										value={toHtmlDateValue(field.state.value || "")}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
									/>
									<Form.FieldMessage
										inputId="endDate"
										status={endDateStatus}
									>
										{field.state.meta.errors[0]}
									</Form.FieldMessage>
								</Form.Field>
							);
						}}
					</form.Field>
				)}
			</Form.Body>
			<Form.Navigation nextButtonLabel="Submit" />
		</Form>
	);
}

export default Step4;

// --- CONTROLLER ---

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
function useStep4Form() {
	// --- HOOKS ---
	const {
		formValues: contextFormValues,
		scope,
		updateFormValues,
		getDefaultValues,
		goToNextStep,
	} = useMultiStepForm();
	const FORM_INPUTS_NAME: (keyof Step4Values)[] = useMemo(
		() => ["startDate", "stillStudying", "endDate"],
		[],
	);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		onSubmit: ({ value }) => {
			updateFormValues(value);

			const finalFormValues = { ...contextFormValues, ...value };
			const result = parseForm(finalFormValues);

			if (result.error) {
				const message = result.error.issues.map((issue) => issue.message).join("\n");
				toast.error(message || "Please complete all fields correctly");
				return;
			}

			clearPersistedInputs(scope, FORM_INPUTS_NAME);
			goToNextStep();
		},
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
	usePersistInput("startDate", formValues.startDate);
	usePersistInput("stillStudying", formValues.stillStudying);
	usePersistInput("endDate", formValues.endDate);

	return { form, onSubmit };
}

// --- VALIDATION RULES ---

const ValidationRules = {
	startDate: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.startDate),
	},
	stillStudying: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.stillStudying),
	},
	endDate: {
		onChangeListenTo: ["stillStudying", "startDate"] as (keyof Step4Values)[],
		onChange: createTSFValidatorFromCustomValidation<Step4Values["endDate"], Step4Values>(
			CustomValidations.step4.endDate,
		),
	},
} satisfies TSFValidationRules<Step4Values>;

const STILL_STUDYING_OPTIONS: RadioGroupOption<boolean>[] = [
	{ label: "Yes", value: true },
	{ label: "No", value: false },
];
