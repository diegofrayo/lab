"use client";

import type { JSX } from "react";
import { useSelector } from "@tanstack/react-form";

import Form from "../../components/form";
import Checkbox from "../../components/primitive/checkbox";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useTSFStep } from "../../hooks/use-form-step";
import {
	createTSFValidatorFromCustomValidation,
	createTSFValidatorFromInputShape,
	CustomValidations,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import { STEP_3_INPUT_NAMES } from "../../utils/types";
import type { Step3Values, TSFValidationRules } from "../../utils/types";

function Step3(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useTSFStep({ inputNames: STEP_3_INPUT_NAMES });
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
								name={field.name}
								checked={field.state.value}
								onBlur={field.handleBlur}
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
										status={collegeNameStatus}
									>
										College name
									</Label>
									<Input
										id="collegeName"
										aria-describedby={getFieldMessageId("collegeName")}
										name={field.name}
										status={collegeNameStatus}
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
} satisfies TSFValidationRules<Step3Values>;
