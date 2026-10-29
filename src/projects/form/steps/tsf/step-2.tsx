"use client";

import type { JSX } from "react";

import Form from "../../components/form";
import { useColombiaLocations } from "../../hooks/use-colombia-locations";
import { useTSFStep } from "../../hooks/use-form-step";
import { createTSFValidatorFromInputShape, formSchema, getTSFFieldStatus } from "../../utils/form";
import { STEP_2_INPUT_NAMES } from "../../utils/types";
import type { Step2Values, TSFValidationRules } from "../../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit, stateOptions, cityOptions, handleStateChange } = useStep2Form();

	// --- COMPUTED STATES ---
	const isCityDisabled = cityOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="state"
					validators={ValidationRules.state}
				>
					{(field) => {
						function handleValueChange(value: string | null): void {
							field.handleChange(value ?? "");
							handleStateChange();
						}

						return (
							<Form.SelectField
								id="state"
								label="State"
								name={field.name}
								status={getTSFFieldStatus(field)}
								message={field.state.meta.errors[0]}
								items={stateOptions}
								placeholder="Select a state"
								value={field.state.value || null}
								onBlur={field.handleBlur}
								onValueChange={handleValueChange}
							/>
						);
					}}
				</form.Field>

				<form.Field
					name="city"
					validators={ValidationRules.city}
				>
					{(field) => (
						<Form.SelectField
							id="city"
							label="City"
							name={field.name}
							status={getTSFFieldStatus(field)}
							message={field.state.meta.errors[0]}
							items={cityOptions}
							placeholder="Select a city"
							disabled={isCityDisabled}
							value={field.state.value || null}
							onBlur={field.handleBlur}
							onValueChange={(value) => field.handleChange(value ?? "")}
						/>
					)}
				</form.Field>
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step2;

// --- CONTROLLER ---

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
function useStep2Form() {
	// --- HOOKS ---
	const { stateOptions, getCitiesOptions } = useColombiaLocations();
	const { form, formValues, onSubmit } = useTSFStep({ inputNames: STEP_2_INPUT_NAMES });

	// --- HANDLERS ---
	function handleStateChange(): void {
		form.setFieldValue("city", "");
	}

	// --- COMPUTED STATES ---
	const cityOptions = formValues.state ? getCitiesOptions(formValues.state) : [];

	return { form, onSubmit, stateOptions, cityOptions, handleStateChange };
}

// --- VALIDATION RULES ---

const ValidationRules = {
	state: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.state),
	},
	city: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.city),
	},
} satisfies TSFValidationRules<Step2Values>;
