"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import type { SelectOption } from "../../components/primitive/select";
import { useColombiaLocations } from "../../hooks/use-colombia-locations";
import { useRHFStep } from "../../hooks/use-form-step";
import { createRHFInputValidator, formSchema, getRHFFieldStatus } from "../../utils/form";
import { STEP_2_INPUT_NAMES } from "../../utils/types";
import type { Step2Values, StepFormReturn } from "../../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const form = useStep2Form();
	const {
		control,
		formState: { errors },
		stateOptions,
		cityOptions,
		handleStateChange,
		onSubmit,
	} = form;

	// --- COMPUTED STATES ---
	const stateStatus = getRHFFieldStatus({ form, name: "state" });
	const cityStatus = getRHFFieldStatus({ form, name: "city" });
	const isCityDisabled = cityOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
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
							<Form.SelectField
								id="state"
								label="State"
								name={field.name}
								status={stateStatus}
								message={errors.state?.message}
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
				<Controller
					name="city"
					control={control}
					rules={ValidationRules.city}
					render={({ field }) => (
						<Form.SelectField
							id="city"
							label="City"
							name={field.name}
							status={cityStatus}
							message={errors.city?.message}
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
