import { useEffect } from "react";

import { composeLocalStorageKeyForInput } from "../utils/form";

export function usePersistInput(inputName: string, inputValue: string): null {
	useEffect((): void => {
		console.log("usePersistInput:", inputName, inputValue);
		window.localStorage.setItem(composeLocalStorageKeyForInput(inputName), String(inputValue));
	}, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
