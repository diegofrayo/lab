import { useCallback, useState } from "react";

function useForceUpdate(): { forceUpdate: () => void } {
	// --- STATES & REFS ---
	const [_, setValue] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars

	// --- ACTIONS ---
	const forceUpdate = useCallback(() => {
		setValue((currentValue) => currentValue + 1);
	}, []);

	return { forceUpdate };
}

export default useForceUpdate;
