"use client";

import { useEffect, useMemo, type JSX } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";
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
	createRHFInputValidator,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getFieldStatus,
	parseForm,
	toHtmlDateValue,
} from "../../utils/form";
import type { FormInputName, Step4Values, StepFormReturn } from "../../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields },
		handleStillStudyingChange,
		onSubmit,
	} = useStep4Form();

	// --- COMPUTED STATES ---
	const stillStudying = formValues.stillStudying;
	const stillStudyingStatus = getFieldStatus({
		hasError: Boolean(errors.stillStudying),
		isTouched: Boolean(dirtyFields.stillStudying) || Boolean(touchedFields.stillStudying),
		hasValue: Boolean(formValues.startDate),
	});
	const startDateStatus = getFieldStatus({
		hasError: Boolean(errors.startDate),
		isTouched: Boolean(dirtyFields.startDate) || Boolean(touchedFields.startDate),
		hasValue: Boolean(formValues.startDate),
	});
	const endDateStatus = getFieldStatus({
		hasError: Boolean(errors.endDate),
		isTouched: Boolean(dirtyFields.endDate) || Boolean(touchedFields.endDate),
		hasValue: Boolean(formValues.endDate),
	});

	// --- STYLES ---
	const classes = {
		checkboxGroup: cn("flex flex-row items-center gap-5"),
		checkboxOption: cn("flex items-center gap-2"),
	};

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="startDate"
						data-state={startDateStatus}
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
								type="date"
								data-state={startDateStatus}
								aria-invalid={startDateStatus === "invalid"}
								name={field.name}
								ref={field.ref}
								value={toHtmlDateValue(field.value)}
								placeholder="yyyy/mm/dd"
								onBlur={field.onBlur}
								onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
							/>
						)}
					/>
					<Form.FieldMessage status={startDateStatus}>
						{errors.startDate?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label data-state={stillStudyingStatus}>Still studying?</Label>
					<Controller
						name="stillStudying"
						control={control}
						rules={ValidationRules.stillStudying}
						render={({ field }) => (
							<div className={classes.checkboxGroup}>
								<div className={classes.checkboxOption}>
									<Checkbox
										id="stillStudyingYes"
										checked={field.value === true}
										data-state={stillStudyingStatus}
										onCheckedChange={(checked) => {
											if (!checked) return;
											field.onChange(true);
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
										checked={field.value === false}
										data-state={stillStudyingStatus}
										onCheckedChange={(checked) => {
											if (!checked) return;
											field.onChange(false);
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
						)}
					/>
				</Form.Field>

				{stillStudying === false && (
					<Form.Field>
						<Label
							htmlFor="endDate"
							data-state={endDateStatus}
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
									type="date"
									data-state={endDateStatus}
									aria-invalid={endDateStatus === "invalid"}
									name={field.name}
									ref={field.ref}
									placeholder="yyyy/mm/dd"
									value={toHtmlDateValue(field.value || "")}
									onBlur={field.onBlur}
									onChange={(event) => field.onChange(fromHtmlDateValue(event.target.value))}
								/>
							)}
						/>
						<Form.FieldMessage status={endDateStatus}>{errors.endDate?.message}</Form.FieldMessage>
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
	const {
		formValues: contextFormValues,
		updateFormValues,
		getDefaultValues,
		goToNextStep,
	} = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(
		() => ["startDate", "stillStudying", "endDate"],
		[],
	);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm<Step4Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleFinalSubmit(data) {
		updateFormValues(data);

		const finalFormValues = { ...contextFormValues, ...data };
		const result = parseForm(finalFormValues);

		if (result.error) {
			const message = result.error.issues.map((issue) => issue.message).join("\n");
			toast.error(message || "Please complete all fields correctly");
		}
	});

	function handleStillStudyingChange(value: boolean): void {
		if (value) {
			form.setValue("endDate", "", { shouldValidate: true });
			return;
		}

		form.trigger("endDate");
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("startDate", formValues.startDate);
	usePersistInput("stillStudying", formValues.stillStudying);
	usePersistInput("endDate", formValues.endDate);
	useFormSubmitted(FORM_INPUTS_NAME, form.formState.isSubmitSuccessful, goToNextStep);

	useEffect(
		function revalidateEndDateOnStartDateChange() {
			if (form.formState.dirtyFields.endDate) {
				form.trigger("endDate");
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[formValues.startDate],
	);

	return { ...form, formValues, onSubmit, handleStillStudyingChange };
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
