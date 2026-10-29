"use client";

import type { JSX } from "react";
import { useSelector } from "@tanstack/react-form";

import Form from "../../components/form";
import Label from "../../components/primitive/label";
import RadioGroup from "../../components/primitive/radio-group";
import type { RadioGroupOption } from "../../components/primitive/radio-group";
import { useTSFStep } from "../../hooks/use-form-step";
import {
	createTSFValidatorFromCustomValidation,
	createTSFValidatorFromInputShape,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getTSFFieldStatus,
	toHtmlDateValue,
} from "../../utils/form";
import { STEP_4_INPUT_NAMES } from "../../utils/types";
import type { Step4Values, TSFValidationRules } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useTSFStep({ inputNames: STEP_4_INPUT_NAMES, isFinalStep: true });
	const stillStudying = useSelector(form.store, (state) => state.values.stillStudying);

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="startDate"
					validators={ValidationRules.startDate}
				>
					{(field) => (
						<Form.TextField
							id="startDate"
							label="Start date"
							type="date"
							name={field.name}
							status={getTSFFieldStatus(field)}
							message={field.state.meta.errors[0]}
							value={toHtmlDateValue(field.state.value)}
							placeholder="yyyy/mm/dd"
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
						/>
					)}
				</form.Field>

				<form.Field
					name="stillStudying"
					validators={ValidationRules.stillStudying}
				>
					{(field) => {
						const stillStudyingStatus = getTSFFieldStatus(field);

						function handleStillStudyingChange(value: boolean): void {
							field.handleChange(value);

							if (value) form.setFieldValue("endDate", "");
						}

						return (
							<Form.Field>
								<Label
									id="stillStudyingLabel"
									status={stillStudyingStatus}
								>
									Still studying?
								</Label>
								<RadioGroup
									aria-labelledby="stillStudyingLabel"
									name={field.name}
									status={stillStudyingStatus}
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
						{(field) => (
							<Form.TextField
								id="endDate"
								label="End date"
								type="date"
								name={field.name}
								status={getTSFFieldStatus(field)}
								message={field.state.meta.errors[0]}
								placeholder="yyyy/mm/dd"
								value={toHtmlDateValue(field.state.value || "")}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
							/>
						)}
					</form.Field>
				)}
			</Form.Body>
			<Form.Navigation nextButtonLabel="Submit" />
		</Form>
	);
}

export default Step4;

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
