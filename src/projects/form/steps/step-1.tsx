"use client";

import { type JSX } from "react";
import { useForm } from "react-hook-form";

import Form from "../components/form";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../context/form.hook";
import { useClearForm } from "../hooks/use-clear-form";
import { usePersistInput } from "../hooks/use-persist-input";
import { asyncCheck } from "../utils/async-validation";
import { formSchema, getFieldStatus, toDataState, validateField } from "../utils/form";
import type { FormInputName, Step1Values, StepFormReturn } from "../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const {
		register,
		formValues,
		formState: { errors, dirtyFields, isValidating },
		onSubmit,
	} = useStep1Form();

	// --- COMPUTED STATES ---
	const nameStatus = getFieldStatus({
		hasError: Boolean(errors.name),
		isTouched: Boolean(dirtyFields.name),
		hasValue: Boolean(formValues.name),
	});
	const emailStatus = getFieldStatus({
		hasError: Boolean(errors.email),
		isTouched: Boolean(dirtyFields.email),
		hasValue: Boolean(formValues.email),
	});
	const usernameStatus = getFieldStatus({
		hasError: Boolean(errors.username),
		isTouched: Boolean(dirtyFields.username),
		hasValue: Boolean(formValues.username),
	});

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
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

			console.log("validateEmailAvailability", value);
			return asyncCheck("email", value, "This email is already taken");
		},
	},
};

const USERNAME_RULES = {
	validate: {
		schema: (value: string): true | string => validateField(formSchema.shape.username, value),
		availability: (value: string): Promise<true | string> | true => {
			if (!value) return true;

			console.log("validateUsernameAvailability", value);
			return asyncCheck("username", value, "This username is already taken");
		},
	},
};
