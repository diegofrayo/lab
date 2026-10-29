import { useMemo } from "react";

import useClientValue from "./use-client-value";

export default function useUrlParams(): URLSearchParams {
	const search = useClientValue({ subscribe, getSnapshot, getServerSnapshot });

	return useMemo(() => new URLSearchParams(search), [search]);
}

// --- UTILS ---

// NOTE: `popstate` only fires on browser back/forward buttons, so the Navigation API is also used to catch
// `history.pushState`/`history.replaceState` calls (e.g. client-side routers)
function subscribe(onStoreChange: () => void): () => void {
	const navigation = getNavigation();

	window.addEventListener("popstate", onStoreChange);
	navigation?.addEventListener("currententrychange", onStoreChange);

	return function unsubscribe(): void {
		window.removeEventListener("popstate", onStoreChange);
		navigation?.removeEventListener("currententrychange", onStoreChange);
	};
}

// NOTE: The Navigation API is not included in the TypeScript DOM lib yet, so it is typed locally
function getNavigation(): EventTarget | undefined {
	return (window as Window & { navigation?: EventTarget }).navigation;
}

function getSnapshot(): string {
	return window.location.search;
}

function getServerSnapshot(): string {
	return "";
}
