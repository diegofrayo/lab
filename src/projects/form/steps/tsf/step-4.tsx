"use client";

import { useMemo, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";
import { toast } from "sonner";

import cn from "~/lib/cn";

import Form from "../../components/form";
import Checkbox from "../../components/primitive/checkbox";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useFormNavigation } from "../../context/form.hook";
import { useFormSubmitted } from "../../hooks/use-form-submitted";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	createTSFValidatorFromCustomValidation,
	createTSFValidatorFromInputShape,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getFieldStatus,
	parseForm,
	toHtmlDateValue,
} from "../../utils/form";
import type { FormInputName, Step4Values } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useStep4Form();
	const stillStudying = useSelector(form.store, (state) => state.values.stillStudying);

	// --- STYLES ---
	const classes = {
		checkboxGroup: cn("flex flex-row items-center gap-5"),
		checkboxOption: cn("flex items-center gap-2"),
	};

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
									type="date"
									data-state={startDateStatus}
									aria-invalid={startDateStatus === "invalid"}
									name={field.name}
									value={toHtmlDateValue(field.state.value)}
									placeholder="yyyy/mm/dd"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
								/>
								<Form.FieldMessage status={startDateStatus}>
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
								<Label data-state={stillStudyingStatus}>Still studying?</Label>
								<div className={classes.checkboxGroup}>
									<div className={classes.checkboxOption}>
										<Checkbox
											id="stillStudyingYes"
											checked={field.state.value === true}
											data-state={stillStudyingStatus}
											onCheckedChange={(checked) => {
												if (!checked) return;
												handleStillStudyingChange(true);
											}}
										/>
										<Label
											htmlFor="stillStudyingYes"
											className="cursor-pointer"
											data-state={stillStudyingStatus}
										>
											Yes
										</Label>
									</div>
									<div className={classes.checkboxOption}>
										<Checkbox
											id="stillStudyingNo"
											checked={field.state.value === false}
											data-state={stillStudyingStatus}
											onCheckedChange={(checked) => {
												if (!checked) return;
												handleStillStudyingChange(false);
											}}
										/>
										<Label
											htmlFor="stillStudyingNo"
											className="cursor-pointer"
											data-state={stillStudyingStatus}
										>
											No
										</Label>
									</div>
								</div>
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
										type="date"
										data-state={endDateStatus}
										aria-invalid={endDateStatus === "invalid"}
										name={field.name}
										placeholder="yyyy/mm/dd"
										value={toHtmlDateValue(field.state.value || "")}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(fromHtmlDateValue(event.target.value))}
									/>
									<Form.FieldMessage status={endDateStatus}>
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
		updateFormValues,
		getDefaultValues,
		goToNextStep,
	} = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["startDate", "stillStudying", "endDate"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues<Step4Values>(FORM_INPUTS_NAME),
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
			}
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
	const isSubmitSuccessful = useSelector(form.store, (state) => state.isSubmitSuccessful);

	// --- EFFECTS ---
	usePersistInput("startDate", formValues.startDate);
	usePersistInput("stillStudying", formValues.stillStudying);
	usePersistInput("endDate", formValues.endDate);
	useFormSubmitted(FORM_INPUTS_NAME, isSubmitSuccessful, goToNextStep);

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
};
