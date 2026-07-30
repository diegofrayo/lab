"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import Button from "../components/primitive/button";
import { useFormNavigation } from "../context/form.hook";

function Step5(): JSX.Element {
	// --- HOOKS ---
	const { formValues, resetForm } = useFormNavigation();

	// --- STYLES ---
	const classes = {
		container: cn("flex flex-col gap-5"),
		pre: cn(
			"overflow-x-auto border-2 border-black bg-neutral-100 p-4 text-xs whitespace-pre-wrap",
			"shadow-[4px_4px_0_0_#000]",
		),
		restartButton: cn("self-end"),
	};

	// --- HANDLERS ---
	function handleRestartClick(): void {
		resetForm();
	}

	return (
		<div className={classes.container}>
			<pre className={classes.pre}>{JSON.stringify(formValues, null, 2)}</pre>
			<Button
				type="button"
				className={classes.restartButton}
				onClick={handleRestartClick}
			>
				Restart
			</Button>
		</div>
	);
}

export default Step5;
