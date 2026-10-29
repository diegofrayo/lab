"use client";

import type { JSX } from "react";
import type { RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import { useRHFStep } from "../../hooks/use-form-step";
import { asyncCheck, debounce } from "../../utils/async";
import { createRHFInputValidator, formSchema, getRHFFieldStatus } from "../../utils/form";
import { STEP_1_INPUT_NAMES } from "../../utils/types";
import type { Step1Values } from "../../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const form = useRHFStep({ inputNames: STEP_1_INPUT_NAMES });
	const {
		register,
		formState: { errors, isValidating, validatingFields },
		onSubmit,
	} = form;

	// --- COMPUTED STATES ---
	const isCheckingUsername = Boolean(validatingFields.username);
	const isCheckingEmail = Boolean(validatingFields.email);
	const nameStatus = getRHFFieldStatus({ form, name: "name" });
	const emailStatus = getRHFFieldStatus({ form, name: "email" });
	const usernameStatus = getRHFFieldStatus({ form, name: "username" });

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.TextField
					id="name"
					label="Name"
					status={nameStatus}
					message={errors.name?.message}
					{...register("name", ValidationRules.name)}
				/>
				<Form.TextField
					id="email"
					label="Email"
					status={emailStatus}
					message={emailStatus === "valid" ? "Email available" : errors.email?.message}
					isLoading={isCheckingEmail}
					loadingLabel="Checking email availability"
					{...register("email", ValidationRules.email)}
				/>
				<Form.TextField
					id="username"
					label="Username"
					status={usernameStatus}
					message={usernameStatus === "valid" ? "Username available" : errors.username?.message}
					isLoading={isCheckingUsername}
					loadingLabel="Checking username availability"
					{...register("username", ValidationRules.username)}
				/>
			</Form.Body>

			<Form.Navigation isNextButtonDisabled={isValidating} />
		</Form>
	);
}

export default Step1;

// --- VALIDATION RULES ---

const ValidationRules: {
	name: RegisterOptions<Step1Values, "name">;
	email: RegisterOptions<Step1Values, "email">;
	username: RegisterOptions<Step1Values, "username">;
} = {
	name: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.name),
		},
	},
	email: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.email),
			availability: async (value: string): Promise<true | string> => {
				return await checkEmailAvailability(value);
			},
		},
	},
	username: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.username),
			availability: async (value: string): Promise<true | string> => {
				return await checkUsernameAvailability(value);
			},
		},
	},
};

const checkEmailAvailability = debounce((value: string): Promise<true | string> | true => {
	if (!value) return true;

	return asyncCheck("email", value, "This email is already taken");
}, 500);

const checkUsernameAvailability = debounce((value: string): Promise<true | string> | true => {
	if (!value) return true;

	return asyncCheck("username", value, "This username is already taken");
}, 500);
