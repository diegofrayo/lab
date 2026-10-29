import useClientValue from "./use-client-value";

function useIsClient(): boolean {
	return useClientValue({ getSnapshot, getServerSnapshot });
}

export default useIsClient;

// --- UTILS ---

function getSnapshot(): boolean {
	return true;
}

function getServerSnapshot(): boolean {
	return false;
}
