"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../context/form.hook";
import { TOTAL_STEPS } from "../utils/types";
import type { FormScope, StepNumber } from "../utils/types";

type StepRendererProps = {
	scope: FormScope;
	stepComponents: Record<StepNumber, () => JSX.Element>;
};

function StepRenderer({ stepComponents, scope }: StepRendererProps): JSX.Element {
	// --- HOOKS ---
	const { currentStep } = useFormNavigation();

	// --- COMPUTED STATES ---
	const StepComponent = stepComponents[currentStep];

	// --- STYLES ---
	const classes = {
		stepBadge: cn(
			"inline-block border-2 border-black bg-yellow-300 px-5 py-2 text-sm font-bold text-black",
			"shadow-[4px_4px_0_0_#000]",
		),
		scopeBadge: cn(
			"inline-block border-2 border-black bg-zinc-700 px-5 py-2 text-sm font-bold text-white",
			"shadow-[4px_4px_0_0_#000]",
		),
		card: cn("border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"),
	};

	return (
		<div>
			<div className="mb-6 flex items-center justify-between gap-2">
				<p className={classes.scopeBadge}>{scope === "rhf" ? "React Hook Form" : "TanStack form"}</p>
				<div className={classes.stepBadge}>
					Step {currentStep} of {TOTAL_STEPS}
				</div>
			</div>
			<section className={classes.card}>
				<StepComponent />
			</section>
		</div>
	);
}

export default StepRenderer;
