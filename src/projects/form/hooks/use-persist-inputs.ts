import { useEffect } from "react";

import { useMultiStepForm } from "../context/form.hook";
import { composeLocalStorageKeyForInput } from "../utils/form";
import type { FormValues } from "../utils/types";

/** Saves each of `inputValues` as a draft in `localStorage` whenever any of them changes. */
export function usePersistInputs(inputValues: Partial<FormValues>): void {
	// --- HOOKS ---
	const { scope } = useMultiStepForm();

	// --- COMPUTED STATES ---
	// `JSON.stringify` drops `undefined` values, so unanswered inputs are not saved.
	const serializedValues = JSON.stringify(inputValues);

	// --- EFFECTS ---
	useEffect(
		function persistInputs() {
			const values = JSON.parse(serializedValues) as Partial<FormValues>;

			Object.entries(values).forEach(([inputName, inputValue]) => {
				window.localStorage.setItem(
					composeLocalStorageKeyForInput(scope, inputName),
					JSON.stringify(inputValue),
				);
			});
		},
		[scope, serializedValues],
	);
}
