"use client";

import type { JSX } from "react";
import { useForm } from "react-hook-form";

import cn from "~/lib/cn";

import Form from "../components/form";
import { useFormNavigation } from "../context/form.hook";
import type { StepFormReturn } from "../utils/types";

function Step3(): JSX.Element {
	// --- HOOKS ---
	const { onSubmit } = useStep3Form();

	// --- STYLES ---
	const classes = {
		placeholder: cn(
			"border-2 border-dashed border-black/40 p-8 text-center text-sm font-bold text-neutral-500",
		),
	};

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<p className={classes.placeholder}>Step 3 — coming soon</p>
			</Form.Body>
			<Form.Navigation />
		</Form>
	);
}

export default Step3;

// --- CONTROLLER ---

function useStep3Form(): StepFormReturn {
	const { goToNextStep } = useFormNavigation();

	const form = useForm();

	const onSubmit = form.handleSubmit(function handleValidSubmit() {
		goToNextStep();
	});

	return { ...form, formValues: {}, onSubmit };
}
