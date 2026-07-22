import { useEffect } from "react";

import type { FormInputName } from "../utils/types";

export function useClearForm(inputNames: FormInputName[]): null {
	useEffect(() => {
		return (): void => {
			console.log("inputNames", inputNames);
			inputNames.forEach((key) => {
				window.localStorage.removeItem(key);
			});
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
