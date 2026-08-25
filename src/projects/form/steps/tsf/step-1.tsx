"use client";

import { useMemo, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";

import Form from "../../components/form";
import Input from "../../components/primitive/input";
import Label from "../../components/primitive/label";
import { useFormNavigation } from "../../context/form.hook";
import { useFormSubmitted } from "../../hooks/use-form-submitted";
import { usePersistInput } from "../../hooks/use-persist-input";
import { asyncCheck } from "../../utils/async";
import { createTSFValidatorFromInputShape, formSchema, getFieldStatus } from "../../utils/form";
import type { FormInputName, Step1Values } from "../../utils/types";

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
									data-state={nameStatus}
								>
									Name
								</Label>
								<Input
									id="name"
									name={field.name}
									data-state={nameStatus}
									aria-invalid={nameStatus === "invalid"}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<Form.FieldMessage status={nameStatus}>
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
					asyncDebounceMs={500}
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
									data-state={emailStatus}
								>
									Email
								</Label>
								<Form.FieldWithLoader isLoading={isCheckingEmail}>
									<Input
										id="email"
										name={field.name}
										data-state={emailStatus}
										aria-invalid={emailStatus === "invalid"}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Form.FieldWithLoader>
								<Form.FieldMessage status={emailStatus}>
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
									data-state={usernameStatus}
								>
									Username
								</Label>
								<Form.FieldWithLoader isLoading={isCheckingUsername}>
									<Input
										id="username"
										name={field.name}
										data-state={usernameStatus}
										aria-invalid={usernameStatus === "invalid"}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</Form.FieldWithLoader>
								<Form.FieldMessage status={usernameStatus}>
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
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["name", "email", "username"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues<Step1Values>(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		onSubmit: ({ value }) => {
			updateFormValues(value);
		},
	});

	// --- HANDLERS ---
	function onSubmit(event?: React.SubmitEvent): void {
		event?.preventDefault();
		event?.stopPropagation();
		form.handleSubmit();
	}

	// --- COMPUTED STATES ---
	const formValues = useSelector(form.store, (state) => state.values);
	const isSubmitSuccessful = useSelector(form.store, (state) => state.isSubmitSuccessful);

	// --- EFFECTS ---
	usePersistInput("name", formValues.name);
	usePersistInput("email", formValues.email);
	usePersistInput("username", formValues.username);
	useFormSubmitted(FORM_INPUTS_NAME, isSubmitSuccessful, goToNextStep);

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
		onChangeAsyncDebounce: 500,
	},
	username: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.username),
		onChangeAsync: validateUsernameAvailability,
		onChangeAsyncDebounceMs: 500,
	},
};

async function validateEmailAvailability({
	value,
}: {
	value: string;
}): Promise<string | undefined> {
	if (!value) return undefined;

	const result = await asyncCheck("email", value, "This email is already taken");
	return result === true ? undefined : result;
}

async function validateUsernameAvailability({
	value,
}: {
	value: string;
}): Promise<string | undefined> {
	if (!value) return undefined;

	const result = await asyncCheck("username", value, "This username is already taken");
	return result === true ? undefined : result;
}
