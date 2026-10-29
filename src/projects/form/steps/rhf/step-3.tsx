"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Checkbox from "../../components/primitive/checkbox";
import Label from "../../components/primitive/label";
import { useRHFStep } from "../../hooks/use-form-step";
import {
	createRHFInputValidator,
	CustomValidations,
	formSchema,
	getRHFFieldStatus,
} from "../../utils/form";
import { STEP_3_INPUT_NAMES } from "../../utils/types";
import type { Step3Values, StepFormReturn } from "../../utils/types";

function Step3(): JSX.Element {
	// --- HOOKS ---
	const form = useStep3Form();
	const {
		control,
		register,
		formValues,
		formState: { errors },
		handleHasCollegeDegreeChange,
		onSubmit,
	} = form;

	// --- COMPUTED STATES ---
	const hasCollegeDegree = Boolean(formValues.hasCollegeDegree);
	const collegeNameStatus = getRHFFieldStatus({ form, name: "collegeName" });

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body className="min-h-32">
				<Form.Field className="flex w-fit flex-row items-center gap-2.5">
					<Controller
						name="hasCollegeDegree"
						control={control}
						rules={ValidationRules.hasCollegeDegree}
						render={({ field }) => {
							function handleCheckedChange(checked: boolean): void {
								field.onChange(checked);
								handleHasCollegeDegreeChange(checked);
							}

							return (
								<Checkbox
									id="hasCollegeDegree"
									name={field.name}
									checked={field.value}
									ref={field.ref}
									onBlur={field.onBlur}
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
					<Form.TextField
						id="collegeName"
						label="College name"
						status={collegeNameStatus}
						message={errors.collegeName?.message}
						{...register("collegeName", ValidationRules.collegeName)}
					/>
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
	const step = useRHFStep({ inputNames: STEP_3_INPUT_NAMES });

	// --- HANDLERS ---
	function handleHasCollegeDegreeChange(checked: boolean): void {
		if (checked) {
			void step.trigger("collegeName");
			return;
		}

		step.setValue("collegeName", "", { shouldValidate: true });
	}

	return { ...step, handleHasCollegeDegreeChange };
}

// --- VALIDATION RULES ---

const ValidationRules: {
	hasCollegeDegree: RegisterOptions<Step3Values, "hasCollegeDegree">;
	collegeName: RegisterOptions<Step3Values, "collegeName">;
} = {
	hasCollegeDegree: {
		validate: {
			schema: createRHFInputValidator<boolean>(formSchema.shape.hasCollegeDegree),
		},
	},
	collegeName: {
		validate: {
			schema: CustomValidations.step3.collegeName,
		},
	},
};
