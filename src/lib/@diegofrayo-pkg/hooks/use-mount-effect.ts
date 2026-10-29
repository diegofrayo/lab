import { useEffect } from "react";

import type ReactTypes from "../types/react";

function useMountEffect(callback: ReactTypes.EffectCallback): void {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(callback, []);
}

export default useMountEffect;
