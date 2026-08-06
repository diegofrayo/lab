"use client";

import type { JSX } from "react";

import FormPage from "../components/form-page";
import Step1 from "../steps/rhf/step-1";
import Step2 from "../steps/rhf/step-2";
import Step3 from "../steps/rhf/step-3";
import Step4 from "../steps/rhf/step-4";
import Step5 from "../steps/step-5";

const STEP_COMPONENTS = {
	1: Step1,
	2: Step2,
	3: Step3,
	4: Step4,
	5: Step5,
};

function FormPageRHF(): JSX.Element | null {
	return (
		<FormPage
			scope="rhf"
			stepComponents={STEP_COMPONENTS}
		/>
	);
}

export default FormPageRHF;
