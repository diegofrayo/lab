"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Label from "../../components/primitive/label";
import Select from "../../components/primitive/select";
import type { SelectOption } from "../../components/primitive/select";
import { useColombiaLocations } from "../../hooks/use-colombia-locations";
import { useRHFStep } from "../../hooks/use-form-step";
import {
	createRHFInputValidator,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import { STEP_2_INPUT_NAMES } from "../../utils/types";
import type { Step2Values, StepFormReturn } from "../../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields, isSubmitted },
		stateOptions,
		cityOptions,
		handleStateChange,
		onSubmit,
	} = useStep2Form();

	// --- COMPUTED STATES ---
	const stateStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.state),
		isTouched: Boolean(dirtyFields.state) || Boolean(touchedFields.state),
		hasValue: Boolean(formValues.state),
	});
	const cityStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.city),
		isTouched: Boolean(dirtyFields.city) || Boolean(touchedFields.city),
		hasValue: Boolean(formValues.city),
	});
	const isCityDisabled = cityOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="state"
						status={stateStatus}
					>
						State
					</Label>
					<Controller
						name="state"
						control={control}
						rules={ValidationRules.state}
						render={({ field }) => {
							function handleStateValueChange(value: string | null): void {
								field.onChange(value);
								handleStateChange();
							}

							return (
								<Select
									id="state"
									name={field.name}
									aria-describedby={getFieldMessageId("state")}
									status={stateStatus}
									items={stateOptions}
									placeholder="Select a state"
									value={field.value || null}
									ref={field.ref}
									onBlur={field.onBlur}
									onValueChange={handleStateValueChange}
								/>
							);
						}}
					/>
					<Form.FieldMessage
						inputId="state"
						status={stateStatus}
					>
						{errors.state?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="city"
						status={cityStatus}
					>
						City
					</Label>
					<Controller
						name="city"
						control={control}
						rules={ValidationRules.city}
						render={({ field }) => (
							<Select
								id="city"
								name={field.name}
								aria-describedby={getFieldMessageId("city")}
								status={cityStatus}
								items={cityOptions}
								placeholder="Select a city"
								disabled={isCityDisabled}
								value={field.value || null}
								ref={field.ref}
								onBlur={field.onBlur}
								onValueChange={field.onChange}
							/>
						)}
					/>
					<Form.FieldMessage
						inputId="city"
						status={cityStatus}
					>
						{errors.city?.message}
					</Form.FieldMessage>
				</Form.Field>
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step2;

// --- CONTROLLER ---

type UseStep2FormReturn = StepFormReturn<Step2Values> & {
	control: Control<Step2Values>;
	stateOptions: SelectOption[];
	cityOptions: SelectOption[];
	handleStateChange: () => void;
};

function useStep2Form(): UseStep2FormReturn {
	// --- HOOKS ---
	const { stateOptions, getCitiesOptions } = useColombiaLocations();
	const step = useRHFStep({ inputNames: STEP_2_INPUT_NAMES });

	// --- HANDLERS ---
	function handleStateChange(): void {
		step.setValue("city", "", { shouldValidate: true, shouldDirty: true });
	}

	// --- COMPUTED STATES ---
	const cityOptions = step.formValues.state ? getCitiesOptions(step.formValues.state) : [];

	return { ...step, stateOptions, cityOptions, handleStateChange };
}

// --- VALIDATION RULES ---

const ValidationRules: {
	state: RegisterOptions<Step2Values, "state">;
	city: RegisterOptions<Step2Values, "city">;
} = {
	state: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.state),
		},
	},
	city: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.city),
		},
	},
};
