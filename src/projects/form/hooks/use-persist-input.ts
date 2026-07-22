import { useEffect } from "react";

export function usePersistInput(inputName: string, inputValue: string): null {
	useEffect((): void => {
		console.log("useSaveOnLocalStorage", inputName, inputValue);
		window.localStorage.setItem(inputName, String(inputValue));
	}, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
