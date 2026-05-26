import { useCallback, useState } from "react";

function useTriggerRender(): { triggerRender: () => void } {
	// --- STATES & REFS ---
	const [_, setValue] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars

	// --- ACTIONS ---
	const triggerRender = useCallback(() => {
		setValue(Date.now());
	}, []);

	return { triggerRender };
}

export default useTriggerRender;
