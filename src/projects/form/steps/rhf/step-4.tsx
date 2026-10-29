"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Label from "../../components/primitive/label";
import RadioGroup from "../../components/primitive/radio-group";
import type { RadioGroupOption } from "../../components/primitive/radio-group";
import { useRHFStep } from "../../hooks/use-form-step";
import {
	createRHFInputValidator,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getRHFFieldStatus,
	toHtmlDateValue,
} from "../../utils/form";
import { STEP_4_INPUT_NAMES } from "../../utils/types";
import type { Step4Values, StepFormReturn } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const form = useStep4Form();
	const {
		control,
		formValues,
		formState: { errors },
		handleStillStudyingChange,
		onSubmit,
	} = form;

	// --- COMPUTED STATES ---
	const stillStudying = formValues.stillStudying;
	const stillStudyingStatus = getRHFFieldStatus({ form, name: "stillStudying" });
	const startDateStatus = getRHFFieldStatus({ form, name: "startDate" });
	const endDateStatus = getRHFFieldStatus({ form, name: "endDate" });

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Controller
					name="startDate"
					control={control}
					rules={ValidationRules.startDate}
					render={({ field }) => (
						<Form.TextField
							id="startDate"
							label="Start date"
							type="date"
							status={startDateStatus}
							message={errors.startDate?.message}
							name={field.name}
							ref={field.ref}
							value={toHtmlDateValue(field.value)}
							placeholder="yyyy/mm/dd"
							onBlur={field.onBlur}
							onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
						/>
					)}
				/>

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
					<Controller
						name="endDate"
						control={control}
						rules={ValidationRules.endDate}
						render={({ field }) => (
							<Form.TextField
								id="endDate"
								label="End date"
								type="date"
								status={endDateStatus}
								message={errors.endDate?.message}
								name={field.name}
								ref={field.ref}
								placeholder="yyyy/mm/dd"
								value={toHtmlDateValue(field.value || "")}
								onBlur={field.onBlur}
								onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
							/>
						)}
					/>
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
