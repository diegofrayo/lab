"use client";

import { useMemo, type JSX } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";
import { toast } from "sonner";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import RadioGroup from "../../components/primitive/radio-group";
import type { RadioGroupOption } from "../../components/primitive/radio-group";
import { useFormNavigation } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	clearPersistedInputs,
	createRHFInputValidator,
	CustomValidations,
	formSchema,
	fromHtmlDateValue,
	getFieldMessageId,
	getFieldStatus,
	parseForm,
	toHtmlDateValue,
} from "../../utils/form";
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
								aria-describedby={getFieldMessageId("startDate")}
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
						data-state={stillStudyingStatus}
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
									data-state={stillStudyingStatus}
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
									aria-describedby={getFieldMessageId("endDate")}
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
	const {
		formValues: contextFormValues,
		scope,
		updateFormValues,
		getDefaultValues,
		goToNextStep,
	} = useFormNavigation();
	const FORM_INPUTS_NAME: (keyof Step4Values)[] = useMemo(() => ["startDate", "stillStudying", "endDate"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm<Step4Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const submitForm = form.handleSubmit(function handleFinalSubmit(data) {
		updateFormValues(data);

		const finalFormValues = { ...contextFormValues, ...data };
		const result = parseForm(finalFormValues);

		if (result.error) {
			const message = result.error.issues.map((issue) => issue.message).join("\n");
			toast.error(message || "Please complete all fields correctly");
			return;
		}

		clearPersistedInputs(scope, FORM_INPUTS_NAME);
		goToNextStep();
	});

	function onSubmit(event?: React.BaseSyntheticEvent): void {
		void submitForm(event);
	}

	function handleStillStudyingChange(value: boolean): void {
		if (value) {
			form.setValue("endDate", "", { shouldValidate: true });
			return;
		}

		void form.trigger("endDate");
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("startDate", formValues.startDate);
	usePersistInput("stillStudying", formValues.stillStudying);
	usePersistInput("endDate", formValues.endDate);

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
