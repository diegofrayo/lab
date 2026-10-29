import { useEffect } from "react";

import { useMultiStepForm } from "../context/form.hook";
import { composeLocalStorageKeyForInput } from "../utils/form";

export function usePersistInput(
	inputName: string,
	inputValue: string | number | boolean | undefined,
): null {
	// --- HOOKS ---
	const { scope } = useMultiStepForm();

	// --- EFFECTS ---
	useEffect((): void => {
		if (inputValue === undefined) return;

		window.localStorage.setItem(
			composeLocalStorageKeyForInput(scope, inputName),
			JSON.stringify(inputValue),
		);
	}, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
