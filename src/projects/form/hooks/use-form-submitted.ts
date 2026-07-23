import { useEffect } from "react";

import { composeLocalStorageKeyForInput } from "../utils/form";
import type { FormInputName } from "../utils/types";

export function useFormSubmitted(
	inputNames: FormInputName[],
	isFormSubmitSuccessful: boolean,
	goToNextStep: () => void,
): null {
	useEffect(() => {
		if (isFormSubmitSuccessful) {
			console.log("useFormSubmitted:", inputNames, isFormSubmitSuccessful);

			inputNames.forEach((inputName) => {
				window.localStorage.removeItem(composeLocalStorageKeyForInput(inputName));
			});

			goToNextStep();
		}
	}, [isFormSubmitSuccessful]); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
