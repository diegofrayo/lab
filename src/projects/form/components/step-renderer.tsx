import type { FunctionComponent, JSX } from "react";

import Step1 from "../steps/step-1";
import Step2 from "../steps/step-2";
import Step3 from "../steps/step-3";
import Step4 from "../steps/step-4";

type StepRendererProps = {
	step: number;
};

function StepRenderer({ step }: StepRendererProps): JSX.Element | null {
	const StepComponent = STEPS[step];

	if (!StepComponent) {
		return null;
	}

	return <StepComponent />;
}

export default StepRenderer;

// --- CONSTANTS ---

const STEPS: Record<number, FunctionComponent> = {
	1: Step1,
	2: Step2,
	3: Step3,
	4: Step4,
};
