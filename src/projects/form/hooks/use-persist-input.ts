import { useEffect } from "react";

import { useFormNavigation } from "../context/form.hook";
import { composeLocalStorageKeyForInput } from "../utils/form";

export function usePersistInput(
	inputName: string,
	inputValue: string | number | boolean | undefined,
): null {
	// --- HOOKS ---
	const { scope } = useFormNavigation();

	// --- EFFECTS ---
	useEffect((): void => {
		if (inputValue === undefined) return;

		console.log("usePersistInput:", inputName, inputValue);
		window.localStorage.setItem(
			composeLocalStorageKeyForInput(scope, inputName),
			String(inputValue),
		);
	}, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
