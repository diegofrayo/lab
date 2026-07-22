"use client";

import type { JSX } from "react";

import cn from "~/lib/cn";

import { useFormNavigation } from "../context/form.hook";
import Step1 from "../steps/step-1";
import Step2 from "../steps/step-2";
import Step3 from "../steps/step-3";
import Step4 from "../steps/step-4";
import { TOTAL_STEPS } from "../utils/types";
import type { StepNumber } from "../utils/types";

const STEP_COMPONENTS: Record<StepNumber, () => JSX.Element> = {
	1: Step1,
	2: Step2,
	3: Step3,
	4: Step4,
};

function StepRenderer(): JSX.Element {
	// --- HOOKS ---
	const { currentStep } = useFormNavigation();

	// --- COMPUTED STATES ---
	const StepComponent = STEP_COMPONENTS[currentStep];

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
