"use client";

import { useMemo, type JSX } from "react";
import { useForm } from "react-hook-form";

import Form from "../components/form";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../context/form.hook";
import { useFormSubmitted } from "../hooks/use-form-submitted";
import { usePersistInput } from "../hooks/use-persist-input";
import { asyncCheck, debounce } from "../utils/async";
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
	const isCheckingUsername = Boolean(validatingFields.username);
	const isCheckingEmail = Boolean(validatingFields.email);
	const nameStatus = getFieldStatus({
		hasError: Boolean(errors.name),
		isTouched: Boolean(dirtyFields.name) || Boolean(touchedFields.name),
		hasValue: Boolean(formValues.name),
	});
	const emailStatus = getFieldStatus({
		hasError: Boolean(errors.email),
		isTouched: Boolean(dirtyFields.email) || Boolean(touchedFields.email),
		hasValue: Boolean(formValues.email),
		isValidating: isCheckingEmail,
	});
	const usernameStatus = getFieldStatus({
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
					<Form.FieldWithLoader isLoading={isCheckingEmail}>
						<Input
							id="email"
							data-state={emailStatus}
							aria-invalid={emailStatus === "invalid"}
							{...register("email", EMAIL_RULES)}
						/>
					</Form.FieldWithLoader>
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
					<Form.FieldWithLoader isLoading={isCheckingUsername}>
						<Input
							id="username"
							data-state={usernameStatus}
							aria-invalid={usernameStatus === "invalid"}
							{...register("username", USERNAME_RULES)}
						/>
					</Form.FieldWithLoader>

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
	// --- HOOKS ---
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["name", "email", "username"], []);
	const DEFAULT_VALUES = useMemo(() => getDefaultValues(FORM_INPUTS_NAME), [FORM_INPUTS_NAME]);
	const form = useForm<Step1Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
	});

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("name", formValues.name);
	usePersistInput("email", formValues.email);
	usePersistInput("username", formValues.username);
	useFormSubmitted(FORM_INPUTS_NAME, form.formState.isSubmitSuccessful, goToNextStep);

	return { ...form, formValues, onSubmit };
}

// --- VALIDATION RULES ---

const NAME_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.name, value),
	},
};

const EMAIL_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.email, value),
		availability: async (value: string): Promise<true | string> => {
			return await checkEmailAvailability(value);
		},
	},
};

const USERNAME_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.username, value),
		availability: async (value: string): Promise<true | string> => {
			return await checkUsernameAvailability(value);
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
