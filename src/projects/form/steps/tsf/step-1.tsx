"use client";

import { useMemo, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useMultiStepForm } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import { asyncCheck } from "../../utils/async";
import {
	clearPersistedInputs,
	createTSFValidatorFromInputShape,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import type { Step1Values, TSFValidationRules } from "../../utils/types";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit } = useStep1Form();
	const isValidating = form.state.isValidating;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="name"
					validators={ValidationRules.name}
				>
					{(field) => {
						const nameStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
						});

						return (
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
									name={field.name}
									status={nameStatus}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<Form.FieldMessage
									inputId="name"
									status={nameStatus}
								>
									{field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
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
						const isCheckingEmail = field.state.meta.isValidating;
						const emailStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
							isValidating: isCheckingEmail,
						});

						return (
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
										name={field.name}
										status={emailStatus}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Form.FieldWithLoader>
								<Form.FieldMessage
									inputId="email"
									status={emailStatus}
								>
									{emailStatus === "valid" ? "Email available" : field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
				</form.Field>

				<form.Field
					name="username"
					validators={ValidationRules.username}
				>
					{(field) => {
						const isCheckingUsername = field.state.meta.isValidating;
						const usernameStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
							isValidating: isCheckingUsername,
						});

						return (
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
										name={field.name}
										status={usernameStatus}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Form.FieldWithLoader>
								<Form.FieldMessage
									inputId="username"
									status={usernameStatus}
								>
									{usernameStatus === "valid" ? "Username available" : field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
				</form.Field>
			</Form.Body>

			<Form.Navigation isNextButtonDisabled={isValidating} />
		</Form>
	);
}

export default Step1;

// --- CONTROLLER ---

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
function useStep1Form() {
	// --- HOOKS ---
	const { scope, updateFormValues, goToNextStep, getDefaultValues } = useMultiStepForm();
	const FORM_INPUTS_NAME: (keyof Step1Values)[] = useMemo(() => ["name", "email", "username"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		onSubmit: ({ value }) => {
			updateFormValues(value);
			clearPersistedInputs(scope, FORM_INPUTS_NAME);
			goToNextStep();
		},
	});

	// --- HANDLERS ---
	function onSubmit(event?: React.SubmitEvent): void {
		event?.preventDefault();
		event?.stopPropagation();
		void form.handleSubmit();
	}

	// --- COMPUTED STATES ---
	const formValues = useSelector(form.store, (state) => state.values);

	// --- EFFECTS ---
	usePersistInput("name", formValues.name);
	usePersistInput("email", formValues.email);
	usePersistInput("username", formValues.username);

	return { form, onSubmit };
}

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
