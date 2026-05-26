import { useEffect } from "react";

function useLockScroll(shouldLockScroll: boolean): void {
	useEffect(() => {
		if (shouldLockScroll) {
			document.body.classList.add("scroll-disabled");
		} else {
			document.body.classList.remove("scroll-disabled");
		}
	}, [shouldLockScroll]);
}

export default useLockScroll;
