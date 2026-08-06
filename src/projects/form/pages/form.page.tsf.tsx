"use client";

import type { JSX } from "react";

import FormPage from "../components/form-page";
import Step5 from "../steps/step-5";
import Step1 from "../steps/tsf/step-1";
import Step2 from "../steps/tsf/step-2";
import Step3 from "../steps/tsf/step-3";
import Step4 from "../steps/tsf/step-4";

const STEP_COMPONENTS = {
	1: Step1,
	2: Step2,
	3: Step3,
	4: Step4,
	5: Step5,
};

function FormPageTSF(): JSX.Element | null {
	return (
		<FormPage
			scope="tsf"
			stepComponents={STEP_COMPONENTS}
		/>
	);
}

export default FormPageTSF;
