"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import RadioGroup from "../../components/primitive/radio-group";
import type { RadioGroupOption } from "../../components/primitive/radio-group";
import { useRHFStep } from "../../hooks/use-form-step";
import {
	createRHFInputValidator,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getFieldMessageId,
	getFieldStatus,
	toHtmlDateValue,
} from "../../utils/form";
import { STEP_4_INPUT_NAMES } from "../../utils/types";
import type { Step4Values, StepFormReturn } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields, isSubmitted },
		handleStillStudyingChange,
		onSubmit,
	} = useStep4Form();

	// --- COMPUTED STATES ---
	const stillStudying = formValues.stillStudying;
	const stillStudyingStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.stillStudying),
		isTouched: Boolean(dirtyFields.stillStudying) || Boolean(touchedFields.stillStudying),
		hasValue: formValues.stillStudying !== undefined,
	});
	const startDateStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.startDate),
		isTouched: Boolean(dirtyFields.startDate) || Boolean(touchedFields.startDate),
		hasValue: Boolean(formValues.startDate),
	});
	const endDateStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.endDate),
		isTouched: Boolean(dirtyFields.endDate) || Boolean(touchedFields.endDate),
		hasValue: Boolean(formValues.endDate),
	});

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="startDate"
						status={startDateStatus}
					>
						Start date
					</Label>
					<Controller
						name="startDate"
						control={control}
						rules={ValidationRules.startDate}
						render={({ field }) => (
							<Input
								id="startDate"
								aria-describedby={getFieldMessageId("startDate")}
								type="date"
								status={startDateStatus}
								name={field.name}
								ref={field.ref}
								value={toHtmlDateValue(field.value)}
								placeholder="yyyy/mm/dd"
								onBlur={field.onBlur}
								onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
							/>
						)}
					/>
					<Form.FieldMessage
						inputId="startDate"
						status={startDateStatus}
					>
						{errors.startDate?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						id="stillStudyingLabel"
						status={stillStudyingStatus}
					>
						Still studying?
					</Label>
					<Controller
						name="stillStudying"
						control={control}
						rules={ValidationRules.stillStudying}
						render={({ field }) => {
							function handleStillStudyingValueChange(value: boolean): void {
								field.onChange(value);
								handleStillStudyingChange(value);
							}

							return (
								<RadioGroup
									aria-labelledby="stillStudyingLabel"
									name={field.name}
									status={stillStudyingStatus}
									items={STILL_STUDYING_OPTIONS}
									value={field.value ?? null}
									onBlur={field.onBlur}
									onValueChange={handleStillStudyingValueChange}
								/>
							);
						}}
					/>
				</Form.Field>

				{stillStudying === false && (
					<Form.Field>
						<Label
							htmlFor="endDate"
							status={endDateStatus}
						>
							End date
						</Label>
						<Controller
							name="endDate"
							control={control}
							rules={ValidationRules.endDate}
							render={({ field }) => (
								<Input
									id="endDate"
									aria-describedby={getFieldMessageId("endDate")}
									type="date"
									status={endDateStatus}
									name={field.name}
									ref={field.ref}
									placeholder="yyyy/mm/dd"
									value={toHtmlDateValue(field.value || "")}
									onBlur={field.onBlur}
									onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
								/>
							)}
						/>
						<Form.FieldMessage
							inputId="endDate"
							status={endDateStatus}
						>
							{errors.endDate?.message}
						</Form.FieldMessage>
					</Form.Field>
				)}
			</Form.Body>
			<Form.Navigation nextButtonLabel="Submit" />
		</Form>
	);
}

export default Step4;

// --- CONTROLLER ---

type UseStep4FormReturn = StepFormReturn<Step4Values> & {
	control: Control<Step4Values>;
	handleStillStudyingChange: (value: boolean) => void;
};

function useStep4Form(): UseStep4FormReturn {
	// --- HOOKS ---
	const step = useRHFStep({ inputNames: STEP_4_INPUT_NAMES, isFinalStep: true });

	// --- HANDLERS ---
	function handleStillStudyingChange(value: boolean): void {
		if (value) {
			step.setValue("endDate", "", { shouldValidate: true });
			return;
		}

		void step.trigger("endDate");
	}

	return { ...step, handleStillStudyingChange };
}

// --- VALIDATION RULES ---

const ValidationRules: {
	startDate: RegisterOptions<Step4Values, "startDate">;
	stillStudying: RegisterOptions<Step4Values, "stillStudying">;
	endDate: RegisterOptions<Step4Values, "endDate">;
} = {
	startDate: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.startDate),
		},
		deps: ["endDate"],
	},
	stillStudying: {
		validate: {
			schema: createRHFInputValidator<boolean>(formSchema.shape.stillStudying),
		},
	},
	endDate: {
		validate: {
			schema: CustomValidations.step4.endDate,
		},
	},
};

const STILL_STUDYING_OPTIONS: RadioGroupOption<boolean>[] = [
	{ label: "Yes", value: true },
	{ label: "No", value: false },
];
