"use client";

import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import cn from "~/lib/cn";

import Form from "../components/form";
import { useFormNavigation } from "../context/form.hook";
import { formSchema } from "../utils/schema";
import type { StepFormReturn } from "../utils/types";

function Step4(): JSX.Element {
	// --- HOOKS ---
	const { onSubmit } = useStep4Form();

	// --- STYLES ---
	const classes = {
		placeholder: cn(
			"border-2 border-dashed border-black/40 p-8 text-center text-sm font-bold text-neutral-500",
		),
	};

	return (
		<Form onSubmit={onSubmit}>
			<Form.Elements>
				<p className={classes.placeholder}>Step 4 — review &amp; submit</p>
			</Form.Elements>
			<Form.Navigation nextButtonLabel="Submit" />
		</Form>
	);
}

export default Step4;

// --- CONTROLLER ---

function useStep4Form(): StepFormReturn {
	const { formValues } = useFormNavigation();

	const form = useForm();

	const onSubmit = form.handleSubmit(function handleFinalSubmit() {
		const result = formSchema.safeParse(formValues);

		if (result.success) {
			toast.success("Form submitted successfully!");
			return;
		}

		const message = result.error.issues.map((issue) => issue.message).join("\n");
		toast.error(message || "Please complete all fields correctly");
	});

	return { ...form, onSubmit };
}
