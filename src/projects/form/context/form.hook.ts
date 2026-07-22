"use client";

import { useContext } from "react";

import { FormContext } from "./form.context";
import type { FormContextValue } from "./form.context";

export function useFormNavigation(): FormContextValue {
	const context = useContext(FormContext);

	if (!context) {
		throw new Error("useFormNavigation must be used within a <FormProvider>");
	}

	return context;
}
