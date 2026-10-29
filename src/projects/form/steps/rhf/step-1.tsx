"use client";

import { useMemo, type JSX } from "react";
import { useForm, type RegisterOptions } from "react-hook-form";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useFormNavigation } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import { asyncCheck, debounce } from "../../utils/async";
import {
	clearPersistedInputs,
	createRHFInputValidator,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import type { FormInputName, Step1Values, StepFormReturn } from "../../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const {
		register,
		formValues,
		formState: { errors, isValidating, validatingFields, touchedFields, dirtyFields, isSubmitted },
		onSubmit,
	} = useStep1Form();

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
						data-state={nameStatus}
					>
						Name
					</Label>
					<Input
						id="name"
						aria-describedby={getFieldMessageId("name")}
						data-state={nameStatus}
						aria-invalid={nameStatus === "invalid"}
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
						data-state={emailStatus}
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
							data-state={emailStatus}
							aria-invalid={emailStatus === "invalid"}
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
						data-state={usernameStatus}
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
							data-state={usernameStatus}
							aria-invalid={usernameStatus === "invalid"}
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

// --- CONTROLLER ---

function useStep1Form(): StepFormReturn<Step1Values> {
	// --- HOOKS ---
	const { scope, updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["name", "email", "username"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues<Step1Values>(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm<Step1Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const submitForm = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
		clearPersistedInputs(scope, FORM_INPUTS_NAME);
		goToNextStep();
	});

	function onSubmit(event?: React.BaseSyntheticEvent): void {
		void submitForm(event);
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("name", formValues.name);
	usePersistInput("email", formValues.email);
	usePersistInput("username", formValues.username);

	return { ...form, formValues, onSubmit };
}

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
