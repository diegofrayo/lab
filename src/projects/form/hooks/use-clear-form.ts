import { useEffect } from "react";

import { composeLocalStorageKeyForInput } from "../utils/form";
import type { FormInputName } from "../utils/types";

export function useClearForm(inputNames: FormInputName[]): null {
	useEffect(() => {
		return (): void => {
			console.log("useClearForm", inputNames);
			inputNames.forEach((inputName) => {
				window.localStorage.removeItem(composeLocalStorageKeyForInput(inputName));
			});
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
