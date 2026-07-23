"use client";

import { type JSX } from "react";
import { useForm } from "react-hook-form";

import cn from "~/lib/cn";

import Form from "../components/form";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../context/form.hook";
import { useClearForm } from "../hooks/use-clear-form";
import { usePersistInput } from "../hooks/use-persist-input";
import { asyncCheck } from "../utils/async-validation";
import { formSchema, getFieldStatus, validateField } from "../utils/form";
import type { FormInputName, Step1Values, StepFormReturn } from "../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const {
		register,
		formValues,
		formState: { errors, isValidating, validatingFields, touchedFields, dirtyFields },
		onSubmit,
	} = useStep1Form();

	// --- COMPUTED STATES ---
	const isCheckingUsername = validatingFields.username;
	const isCheckingEmail = validatingFields.email;
	const nameStatus = getFieldStatus({
		hasError: Boolean(errors.name),
		isTouched: Boolean(touchedFields.name) || Boolean(dirtyFields.name),
		hasValue: Boolean(formValues.name),
	});
	const emailStatus = getFieldStatus({
		hasError: Boolean(errors.email),
		isTouched: Boolean(touchedFields.email) || Boolean(dirtyFields.email),
		hasValue: Boolean(formValues.email),
		isValidating: isCheckingEmail,
	});
	const usernameStatus = getFieldStatus({
		hasError: Boolean(errors.username),
		isTouched: Boolean(touchedFields.username) || Boolean(dirtyFields.username),
		hasValue: Boolean(formValues.username),
		isValidating: isCheckingUsername,
	});

	// --- STYLES ---
	const classes = {
		spinner: cn(
			"absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-black border-t-transparent",
		),
	};

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="name"
						data-state={nameStatus}
					>
						Name
					</Label>
					<Input
						id="name"
						data-state={nameStatus}
						aria-invalid={nameStatus === "invalid"}
						{...register("name", NAME_RULES)}
					/>
					<Form.FieldMessage status={nameStatus}>{errors.name?.message}</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="email"
						data-state={emailStatus}
					>
						Email
					</Label>
					<div className="relative">
						<Input
							id="email"
							data-state={emailStatus}
							aria-invalid={emailStatus === "invalid"}
							{...register("email", EMAIL_RULES)}
						/>
						{isCheckingEmail && (
							<span
								className={classes.spinner}
								role="status"
								aria-label="Checking email availability"
							/>
						)}
					</div>
					<Form.FieldMessage status={emailStatus}>
						{emailStatus === "valid" ? "Email available" : errors.email?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="username"
						data-state={usernameStatus}
					>
						Username
					</Label>
					<div className="relative">
						<Input
							id="username"
							data-state={usernameStatus}
							aria-invalid={usernameStatus === "invalid"}
							{...register("username", USERNAME_RULES)}
						/>
						{isCheckingUsername && (
							<span
								className={classes.spinner}
								role="status"
								aria-label="Checking username availability"
							/>
						)}
					</div>

					<Form.FieldMessage status={usernameStatus}>
						{usernameStatus === "valid" ? "Username available" : errors.username?.message}
					</Form.FieldMessage>
				</Form.Field>
			</Form.Body>

			<Form.Navigation isNextButtonDisabled={isValidating} />
		</Form>
	);
}

export default Step1;

// --- CONTROLLER ---

function useStep1Form(): StepFormReturn<Step1Values> {
	const FORM_INPUTS_NAME: FormInputName[] = ["name", "email", "username"];

	// --- HOOKS ---
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const form = useForm<Step1Values>({
		mode: "onChange",
		defaultValues: getDefaultValues(FORM_INPUTS_NAME),
	});

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
		goToNextStep();
	});

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("name", formValues.name);
	usePersistInput("email", formValues.email);
	usePersistInput("username", formValues.username);
	useClearForm(FORM_INPUTS_NAME);

	return { ...form, formValues, onSubmit };
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
		availability: (value: string): Promise<true | string> | true => {
			if (!value) return true;

			return asyncCheck("email", value, "This email is already taken");
		},
	},
};

const USERNAME_RULES = {
	validate: {
		schema: (value: string): true | string => validateField(formSchema.shape.username, value),
		availability: (value: string): Promise<true | string> | true => {
			if (!value) return true;

			return asyncCheck("username", value, "This username is already taken");
		},
	},
};
