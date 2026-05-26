import { useEffect, useRef, useState } from "react";

import type UtilsTypes from "../types";

function useTypingTextEffect(text: string): string {
	// --- STATE & REFS ---
	const [output, setOutput] = useState(text.charAt(0));
	const outputIndexRef = useRef(1);
	const intervalRef = useRef<UtilsTypes.SetTimeout | null>(null);

	// --- EFFECTS ---
	useEffect(
		function startInterval() {
			if (!intervalRef.current) {
				intervalRef.current = setInterval(() => {
					setOutput((currentState) => {
						const newState = `${currentState}${text.charAt(outputIndexRef.current)}`;
						outputIndexRef.current += 1;

						return newState;
					});
				}, 250);
			}

			return (): void => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			};
		},
		[text],
	);

	useEffect(
		function stopInterval() {
			if (output === text && intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		},
		[output, text],
	);

	return output;
}

export default useTypingTextEffect;
