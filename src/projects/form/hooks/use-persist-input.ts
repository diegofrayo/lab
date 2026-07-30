import { useEffect } from "react";

import { composeLocalStorageKeyForInput } from "../utils/form";

export function usePersistInput(
	inputName: string,
	inputValue: string | number | boolean | undefined,
): null {
	useEffect((): void => {
		if (inputValue === undefined) return;

		console.log("usePersistInput:", inputName, inputValue);
		window.localStorage.setItem(composeLocalStorageKeyForInput(inputName), String(inputValue));
	}, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
