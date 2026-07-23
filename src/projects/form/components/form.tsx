"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../context/form.hook";
import type { FieldStatus } from "../utils/types";
import Button from "./primitive/button";

type FormProps = React.ComponentPropsWithoutRef<"form">;

function FormRoot({ className, children, ...props }: FormProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		form: cn("flex flex-col gap-10", className),
	};

	return (
		<form
			noValidate
			className={classes.form}
			{...props}
		>
			{children}
		</form>
	);
}

const Form = Object.assign(FormRoot, {
	Body: FormBody,
	Field: FormField,
	FieldMessage: FormFieldMessage,
	Navigation: FormNavigation,
});

export default Form;

// --- COMPONENTS ---

type FormBodyProps = React.ComponentPropsWithoutRef<"div">;

function FormBody({ className, children, ...props }: FormBodyProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		Body: cn("flex flex-col gap-5", className),
	};

	return (
		<div
			className={classes.Body}
			{...props}
		>
			{children}
		</div>
	);
}

type FormFieldProps = React.ComponentPropsWithoutRef<"div">;

function FormField({ className, children, ...props }: FormFieldProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		field: cn("flex flex-col gap-1.5", className),
	};

	return (
		<div
			className={classes.field}
			{...props}
		>
			{children}
		</div>
	);
}

type FormFieldMessageProps = React.ComponentPropsWithoutRef<"span"> & {
	status: FieldStatus;
};

function FormFieldMessage({
	className,
	status,
	children,
	...props
}: FormFieldMessageProps): JSX.Element | null {
	// --- STYLES ---
	const classes = {
		message: cn(
			"text-sm font-bold",
			{ "text-green-600": status === "valid", "text-red-600": status === "invalid" },
			className,
		),
	};

	if (!children || status === "neutral") return null;

	return (
		<span
			className={classes.message}
			{...props}
		>
			{children}
		</span>
	);
}

type FormNavigationProps = {
	isNextButtonDisabled?: boolean;
	nextButtonLabel?: string;
};

function FormNavigation({
	isNextButtonDisabled = false,
	nextButtonLabel = "Next",
}: FormNavigationProps): JSX.Element {
	// --- HOOKS ---
	const { currentStep, goToPreviousStep } = useFormNavigation();

	// --- COMPUTED STATES ---
	const isFirstStep = currentStep === 1;

	// --- STYLES ---
	const classes = {
		container: cn("flex items-center justify-between gap-3"),
	};

	// --- HANDLERS ---
	function handlePreviousClick(): void {
		goToPreviousStep();
	}

	return (
		<div className={classes.container}>
			<Button
				type="button"
				disabled={isFirstStep}
				onClick={handlePreviousClick}
			>
				Previous
			</Button>
			<Button
				type="submit"
				disabled={isNextButtonDisabled}
			>
				{nextButtonLabel}
			</Button>
		</div>
	);
}
