"use client";

import type { JSX } from "react";
import { useForm } from "react-hook-form";
import type { RegisterOptions } from "react-hook-form";

import cn from "~/lib/cn";

import FormNavigationButtons from "../components/form-navigation-buttons";
import ErrorMessage from "../components/primitive/error-message";
import Input from "../components/primitive/input";
import Label from "../components/primitive/label";
import { useFormNavigation } from "../hooks/use-form-navigation";
import { getFieldState } from "../utils/form";

function Step1(): JSX.Element {
	// --- HOOKS ---
	const { updateFormValues, formValues, goToNextStep } = useFormNavigation();
	const {
		register,
		handleSubmit,
		formState: { errors, touchedFields, validatingFields, isValid },
	} = useForm<Step1FormValues>({
		mode: "onTouched",
		// `values` (unlike `defaultValues`, which is read only once on init) keeps
		// the form in sync when the stored values arrive from localStorage after
		// mount — otherwise the form would stay empty.
		values: {
			name: formValues.name,
			lastName: formValues.lastName,
			username: formValues.username,
		},
	});
	const validations = useStep1Validations();

	// --- COMPUTED STATES ---
	const isCheckingUsername = Boolean(validatingFields.username);
	const isNameValid = Boolean(touchedFields.name) && !errors.name;
	const isLastNameValid = Boolean(touchedFields.lastName) && !errors.lastName;
	const isUsernameValid =
		Boolean(touchedFields.username) && !errors.username && !isCheckingUsername;

	const nameState = getFieldState(isNameValid, Boolean(errors.name));
	const lastNameState = getFieldState(isLastNameValid, Boolean(errors.lastName));
	const usernameState = getFieldState(isUsernameValid, Boolean(errors.username));

	// --- STYLES ---
	const classes = {
		form: cn("flex flex-col gap-4"),
		field: cn("flex flex-col gap-1.5"),
		inputControl: cn("relative"),
		spinner: cn(
			"absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-black border-t-transparent",
		),
		success: cn("text-sm text-green-600"),
		usernameInput: cn("pr-9"),
	};

	// --- HANDLERS ---
	function handleValidSubmit(values: Step1FormValues): void {
		console.log(values);
		updateFormValues(values);
		goToNextStep();
	}

	return (
		<form
			className={classes.form}
			onSubmit={handleSubmit(handleValidSubmit)}
			noValidate
		>
			<div className={classes.field}>
				<Label
					htmlFor="name"
					data-state={nameState}
				>
					Name
				</Label>
				<Input
					id="name"
					aria-invalid={Boolean(errors.name)}
					data-state={nameState}
					{...register("name", validations.name)}
				/>
				{errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
			</div>

			<div className={classes.field}>
				<Label
					htmlFor="lastName"
					data-state={lastNameState}
				>
					Last name
				</Label>
				<Input
					id="lastName"
					aria-invalid={Boolean(errors.lastName)}
					data-state={lastNameState}
					{...register("lastName", validations.lastName)}
				/>
				{errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
			</div>

			<div className={classes.field}>
				<Label
					htmlFor="username"
					data-state={usernameState}
				>
					Username
				</Label>
				<div className={classes.inputControl}>
					<Input
						id="username"
						aria-invalid={Boolean(errors.username)}
						data-state={usernameState}
						className={classes.usernameInput}
						{...register("username", validations.username)}
					/>
					{isCheckingUsername && (
						<span
							className={classes.spinner}
							role="status"
							aria-label="Checking username availability"
						/>
					)}
				</div>
				{errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
				{isUsernameValid && <span className={classes.success}>This username is available</span>}
			</div>

			<FormNavigationButtons isCurrentFormValid={isValid} />
		</form>
	);
}

export default Step1;

// --- TYPES ---

type Step1FormValues = {
	name: string;
	lastName: string;
	username: string;
};

// --- HOOKS ---

function useStep1Validations(): Record<keyof Step1FormValues, RegisterOptions<Step1FormValues>> {
	// --- REFS ---
	// Keep a single debounced instance stable across renders so the timer isn't
	// recreated (which would defeat the debounce).
	// const debouncedCheckRef = useRef(debounceAsync(checkUsernameAvailability, 500));

	// --- UTILS ---
	const lengthRules = {
		minLength: { value: 3, message: "Must be at least 3 characters" },
		maxLength: { value: 30, message: "Must be at most 30 characters" },
	};

	return {
		name: {
			required: "Name is required",
			...lengthRules,
		},
		lastName: {
			required: "Last name is required",
			...lengthRules,
		},
		username: {
			required: "Username is required",
			...lengthRules,
			pattern: {
				value: /^[A-Za-z0-9_-]+$/,
				message: "Only letters, numbers, _ and - are allowed",
			},

			// Async availability check, debounced so it only runs once the user
			// pauses typing. RHF awaits the returned promise and surfaces the
			// rejection message as the field error.
			validate: async (): Promise<boolean> => {
				return true;
				// try {
				// 	return true;
				// 	console.log("username value", value);
				// 	await new Promise((resolve) => setTimeout(resolve, 500 * 1));
				// 	await checkUsernameAvailability();
				// 	// await debouncedCheckRef.current();
				// 	return true;
				// } catch (error) {
				// 	if (rejectedByDebounceAsync(error)) return true;
				// 	return getErrorMessage(error, "Username is not available.");
				// }
			},
		},
	};
}

// --- UTILS ---

/*
// Cycles between resolve/reject on each invocation: 1st call succeeds, 2nd
// fails, 3rd succeeds, and so on indefinitely. The counter lives at module
// scope so the alternation persists across calls (and across re-renders).
let usernameCheckCount = 0;

function checkUsernameAvailability(): Promise<boolean> {
	usernameCheckCount += 1;
	const isAvailable = usernameCheckCount % 2 === 1;

	return new Promise((resolve, reject) => {
		if (isAvailable) {
			resolve(true);
		} else {
			reject(new Error("This username is already taken"));
		}
	});
}
*/
