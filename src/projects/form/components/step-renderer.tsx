"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../context/form.hook";
import { TOTAL_STEPS } from "../utils/types";
import type { StepNumber } from "../utils/types";

type StepRendererProps = { stepComponents: Record<StepNumber, () => JSX.Element> };

function StepRenderer({ stepComponents }: StepRendererProps): JSX.Element {
	// --- HOOKS ---
	const { currentStep } = useFormNavigation();

	// --- COMPUTED STATES ---
	const StepComponent = stepComponents[currentStep];

	// --- STYLES ---
	const classes = {
		badge: cn(
			"mb-6 inline-block border-2 border-black bg-yellow-300 px-5 py-2 text-sm font-bold text-black",
			"shadow-[4px_4px_0_0_#000]",
		),
		card: cn("border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"),
	};

	return (
		<div>
			<div className={classes.badge}>
				Step {currentStep} of {TOTAL_STEPS}
			</div>
			<section className={classes.card}>
				<StepComponent />
			</section>
		</div>
	);
}

export default StepRenderer;
