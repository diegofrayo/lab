"use client";

import type { JSX } from "react";
import { useForm } from "react-hook-form";

import cn from "~/lib/cn";

import Form from "../components/form";
import { useFormNavigation } from "../context/form.hook";
import type { StepFormReturn } from "../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const { onSubmit } = useStep2Form();

	// --- STYLES ---
	const classes = {
		placeholder: cn(
			"border-2 border-dashed border-black/40 p-8 text-center text-sm font-bold text-neutral-500",
		),
	};

	return (
		<Form onSubmit={onSubmit}>
			<Form.Elements>
				<p className={classes.placeholder}>Step 2 — coming soon</p>
			</Form.Elements>
			<Form.Navigation />
		</Form>
	);
}

export default Step2;

// --- CONTROLLER ---

function useStep2Form(): StepFormReturn {
	const { goToNextStep } = useFormNavigation();

	const form = useForm();

	const onSubmit = form.handleSubmit(function handleValidSubmit() {
		goToNextStep();
	});

	return { ...form, onSubmit };
}
