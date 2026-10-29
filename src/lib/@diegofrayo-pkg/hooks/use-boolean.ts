import { useCallback, useRef, useState } from "react";

import type ReactTypes from "@diegofrayo-pkg/types/react";

function useBoolean(initialState: boolean): UseBooleanResult {
	// --- STATE & REFS ---
	const initialStateRef = useRef<typeof initialState>(initialState);
	const [state, setState] = useState<typeof initialState>(initialState);

	// --- ACTIONS ---
	const setTrue = useCallback(() => {
		setState(true);
	}, []);

	const setFalse = useCallback(() => {
		setState(false);
	}, []);

	const toggleState = useCallback(() => {
		setState((currentValue: boolean) => !currentValue);
	}, []);

	const reset = useCallback(() => {
		setState(initialStateRef.current);
	}, []);

	return { state: state, set: setState, setTrue, setFalse, toggleState, reset };
}

export default useBoolean;

// --- TYPES ---

type UseBooleanResult = {
	state: boolean;
	set: ReactTypes.SetState<boolean>;
	setTrue: () => void;
	setFalse: () => void;
	toggleState: () => void;
	reset: () => void;
};
