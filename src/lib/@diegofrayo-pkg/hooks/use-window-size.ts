import { useLayoutEffect, useState } from "react";

function useWindowSize(): [number, number] {
	// --- STATE & REFS ---
	const [size, setSize] = useState<[number, number]>([0, 0]);

	// --- EFFECTS ---
	useLayoutEffect(() => {
		const updateSize = (): void => setSize([window.innerWidth, window.innerHeight]);

		updateSize();

		window.addEventListener("resize", updateSize);

		return (): void => window.removeEventListener("resize", updateSize);
	}, []);

	return size;
}

export default useWindowSize;
