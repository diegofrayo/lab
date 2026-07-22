"use client";

import type { JSX } from "react";
import { useForm } from "react-hook-form";

import Form from "../components/form";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../context/form.hook";
import { asyncCheck } from "../utils/async-validation";
import { getFieldStatus, toDataState } from "../utils/form";
import { formSchema, validateField } from "../utils/schema";
import type { Step1Values, StepFormReturn } from "../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const {
		register,
		watch,
		formState: { errors, dirtyFields, isValidating },
		onSubmit,
	} = useStep1Form();

	// --- COMPUTED STATES ---
	const values = watch();
	const nameStatus = getFieldStatus({
		hasError: Boolean(errors.name),
		isTouched: Boolean(dirtyFields.name),
		hasValue: Boolean(values.name),
	});
	const emailStatus = getFieldStatus({
		hasError: Boolean(errors.email),
		isTouched: Boolean(dirtyFields.email),
		hasValue: Boolean(values.email),
	});
	const usernameStatus = getFieldStatus({
		hasError: Boolean(errors.username),
		isTouched: Boolean(dirtyFields.username),
		hasValue: Boolean(values.username),
	});

	return (
		<Form onSubmit={onSubmit}>
			<Form.Elements>
				<Form.Field>
					<Label
						htmlFor="name"
						data-state={toDataState(nameStatus)}
					>
						Name
					</Label>
					<Input
						id="name"
						data-state={toDataState(nameStatus)}
						aria-invalid={nameStatus === "INVALID"}
						{...register("name", NAME_RULES)}
					/>
					<Form.FieldMessage status={nameStatus}>{errors.name?.message}</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="email"
						data-state={toDataState(emailStatus)}
					>
						Email
					</Label>
					<Input
						id="email"
						data-state={toDataState(emailStatus)}
						aria-invalid={emailStatus === "INVALID"}
						{...register("email", EMAIL_RULES)}
					/>
					<Form.FieldMessage status={emailStatus}>
						{emailStatus === "VALID" ? "Email available" : errors.email?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="username"
						data-state={toDataState(usernameStatus)}
					>
						Username
					</Label>
					<Input
						id="username"
						data-state={toDataState(usernameStatus)}
						aria-invalid={usernameStatus === "INVALID"}
						{...register("username", USERNAME_RULES)}
					/>
					<Form.FieldMessage status={usernameStatus}>
						{usernameStatus === "VALID" ? "Username available" : errors.username?.message}
					</Form.FieldMessage>
				</Form.Field>
			</Form.Elements>

			<Form.Navigation isNextButtonDisabled={isValidating} />
		</Form>
	);
}

export default Step1;

// --- CONTROLLER ---

function useStep1Form(): StepFormReturn<Step1Values> {
	const { formValues, updateFormValues, goToNextStep } = useFormNavigation();

	const form = useForm<Step1Values>({
		mode: "onChange",
		defaultValues: {
			name: formValues.name ?? "",
			email: formValues.email ?? "",
			username: formValues.username ?? "",
		},
	});

	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
		goToNextStep();
	});

	return { ...form, onSubmit };
}

// --- VALIDATION RULES ---

const NAME_RULES = {
	validate: {
		schema: (value: string): true | string => validateField(formSchema.shape.name, value),
	},
};

const EMAIL_RULES = {
	validate: {
		schema: (value: string): true | string => validateField(formSchema.shape.email, value),
		availability: validateEmailAvailability,
	},
};

const USERNAME_RULES = {
	validate: {
		schema: (value: string): true | string => validateField(formSchema.shape.username, value),
		availability: validateUsernameAvailability,
	},
};

// --- UTILS ---

function validateEmailAvailability(value: string): Promise<true | string> | true {
	if (!value) return true;
	console.log("validateEmailAvailability");
	return asyncCheck("email", value, "This email is already taken");
}

function validateUsernameAvailability(value: string): Promise<true | string> | true {
	if (!value) return true;
	console.log("validateUsernameAvailability");
	return asyncCheck("username", value, "This username is already taken");
}
