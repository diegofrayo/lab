import { useSyncExternalStore } from "react";

type UseClientValueParams<Value> = {
	subscribe?: (onStoreChange: () => void) => () => void;
	getSnapshot: () => Value;
	getServerSnapshot: () => Value;
};

type UseClientValueReturn<Value> = Value;

function useClientValue<Value>(params: UseClientValueParams<Value>): UseClientValueReturn<Value> {
	return useSyncExternalStore<Value>(
		params.subscribe || subscribe,
		params.getSnapshot,
		params.getServerSnapshot,
	);
}

export default useClientValue;

// --- UTILS ---

// NOTE: Declared outside the hook so their identity is stable, otherwise `useSyncExternalStore` resubscribes on every render
function subscribe(): () => void {
	return function unsubscribe(): void {};
}
