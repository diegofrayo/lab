import { funnel } from "remeda";

// Sentinel used to reject calls that were superseded by a newer one before
// their timer fired. RHF discards superseded async validations anyway, so the
// caller treats this as a no-op rather than a real validation failure.
const DEBOUNCED_SUPERSEDED = Symbol("debounced-superseded");

// Wraps an async function so it only actually runs after `delay` ms of quiet,
// using remeda's `funnel` for the debounce timing. `funnel`'s callback is
// fire-and-forget, so we bridge each `call()` to a promise: the funnel resolves
// the latest pending promise when it fires, and any earlier pending promise is
// rejected with the superseded sentinel so it never dangles.
export function debounceAsync<T>(fn: () => Promise<T>, delay: number): () => Promise<T> {
	let resolvePending: ((value: Promise<T>) => void) | undefined;
	let rejectPending: ((reason: unknown) => void) | undefined;

	const debouncer = funnel(
		() => {
			resolvePending?.(fn());
			resolvePending = undefined;
			rejectPending = undefined;
		},
		{ minQuietPeriodMs: delay, triggerAt: "end" },
	);

	return function debounced(): Promise<T> {
		rejectPending?.(DEBOUNCED_SUPERSEDED);

		return new Promise<T>((resolve, reject) => {
			resolvePending = resolve;
			rejectPending = reject;
			debouncer.call();
		});
	};
}

// Superseded by a newer keystroke — let the newer call decide.
export function rejectedByDebounceAsync(error: unknown): boolean {
	return error === DEBOUNCED_SUPERSEDED;
}
