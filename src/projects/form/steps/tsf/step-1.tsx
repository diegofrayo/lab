"use client";

import type { JSX } from "react";

import Form from "../../components/form";
import { useTSFStep } from "../../hooks/use-form-step";
import { asyncCheck } from "../../utils/async";
import { createTSFValidatorFromInputShape, formSchema, getTSFFieldStatus } from "../../utils/form";
import { STEP_1_INPUT_NAMES } from "../../utils/types";
import type { Step1Values, TSFValidationRules } from "../../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useTSFStep({ inputNames: STEP_1_INPUT_NAMES });
	const isValidating = form.state.isValidating;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="name"
					validators={ValidationRules.name}
				>
					{(field) => (
						<Form.TextField
							id="name"
							label="Name"
							name={field.name}
							status={getTSFFieldStatus(field)}
							message={field.state.meta.errors[0]}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
					)}
				</form.Field>

				<form.Field
					name="email"
					validators={ValidationRules.email}
					listeners={{
						onChange: (field) => {
							form.setFieldMeta("email", { ...field.fieldApi.getMeta(), isValidating: true });
						},
					}}
				>
					{(field) => {
						const emailStatus = getTSFFieldStatus(field);

						return (
							<Form.TextField
								id="email"
								label="Email"
								name={field.name}
								status={emailStatus}
								message={emailStatus === "valid" ? "Email available" : field.state.meta.errors[0]}
								isLoading={field.state.meta.isValidating}
								loadingLabel="Checking email availability"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						);
					}}
				</form.Field>

				<form.Field
					name="username"
					validators={ValidationRules.username}
				>
					{(field) => {
						const usernameStatus = getTSFFieldStatus(field);

						return (
							<Form.TextField
								id="username"
								label="Username"
								name={field.name}
								status={usernameStatus}
								message={usernameStatus === "valid" ? "Username available" : field.state.meta.errors[0]}
								isLoading={field.state.meta.isValidating}
								loadingLabel="Checking username availability"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						);
					}}
				</form.Field>
			</Form.Body>

			<Form.Navigation isNextButtonDisabled={isValidating} />
		</Form>
	);
}

export default Step1;

// --- VALIDATION RULES ---

const ValidationRules = {
	name: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.name),
	},
	email: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.email),
		onChangeAsync: validateEmailAvailability,
		onChangeAsyncDebounceMs: 500,
	},
	username: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.username),
		onChangeAsync: validateUsernameAvailability,
		onChangeAsyncDebounceMs: 500,
	},
} satisfies TSFValidationRules<Step1Values>;

async function validateEmailAvailability({ value }: { value: string }): Promise<string | undefined> {
	if (!value) return undefined;

	const result = await asyncCheck("email", value, "This email is already taken");
	return result === true ? undefined : result;
}

async function validateUsernameAvailability({ value }: { value: string }): Promise<string | undefined> {
	if (!value) return undefined;

	const result = await asyncCheck("username", value, "This username is already taken");
	return result === true ? undefined : result;
}
