"use client";

import type { JSX } from "react";
import type { RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useRHFStep } from "../../hooks/use-form-step";
import { asyncCheck, debounce } from "../../utils/async";
import {
	createRHFInputValidator,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import { STEP_1_INPUT_NAMES } from "../../utils/types";
import type { Step1Values } from "../../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const {
		register,
		formValues,
		formState: { errors, isValidating, validatingFields, touchedFields, dirtyFields, isSubmitted },
		onSubmit,
	} = useRHFStep({ inputNames: STEP_1_INPUT_NAMES });

	// --- COMPUTED STATES ---
	const isCheckingUsername = Boolean(validatingFields.username);
	const isCheckingEmail = Boolean(validatingFields.email);
	const nameStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.name),
		isTouched: Boolean(dirtyFields.name) || Boolean(touchedFields.name),
		hasValue: Boolean(formValues.name),
	});
	const emailStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.email),
		isTouched: Boolean(dirtyFields.email) || Boolean(touchedFields.email),
		hasValue: Boolean(formValues.email),
		isValidating: isCheckingEmail,
	});
	const usernameStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.username),
		isTouched: Boolean(dirtyFields.username) || Boolean(touchedFields.username),
		hasValue: Boolean(formValues.username),
		isValidating: isCheckingUsername,
	});

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="name"
						status={nameStatus}
					>
						Name
					</Label>
					<Input
						id="name"
						aria-describedby={getFieldMessageId("name")}
						status={nameStatus}
						{...register("name", ValidationRules.name)}
					/>
					<Form.FieldMessage
						inputId="name"
						status={nameStatus}
					>
						{errors.name?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="email"
						status={emailStatus}
					>
						Email
					</Label>
					<Form.FieldWithLoader
						isLoading={isCheckingEmail}
						loadingLabel="Checking email availability"
					>
						<Input
							id="email"
							aria-describedby={getFieldMessageId("email")}
							status={emailStatus}
							{...register("email", ValidationRules.email)}
						/>
					</Form.FieldWithLoader>
					<Form.FieldMessage
						inputId="email"
						status={emailStatus}
					>
						{emailStatus === "valid" ? "Email available" : errors.email?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="username"
						status={usernameStatus}
					>
						Username
					</Label>
					<Form.FieldWithLoader
						isLoading={isCheckingUsername}
						loadingLabel="Checking username availability"
					>
						<Input
							id="username"
							aria-describedby={getFieldMessageId("username")}
							status={usernameStatus}
							{...register("username", ValidationRules.username)}
						/>
					</Form.FieldWithLoader>

					<Form.FieldMessage
						inputId="username"
						status={usernameStatus}
					>
						{usernameStatus === "valid" ? "Username available" : errors.username?.message}
					</Form.FieldMessage>
				</Form.Field>
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
