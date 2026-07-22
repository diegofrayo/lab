/**
 * Simulated async availability check (e.g. "is this username/email taken?").
 *
 * Deterministic on purpose: each call advances a shared counter. Even calls
 * resolve as available, odd calls resolve as taken. Shaped to plug directly
 * into a `react-hook-form` `validate` rule, which treats `true` as valid and a
 * string as an error message.
 */

const SIMULATED_LATENCY_MS = 600;

let counter = 0;
const cache: Record<string, Record<string, string | true>> = {};

export function asyncCheck(
	key: string,
	value: string,
	errorMessage = "This value is already taken",
): Promise<true | string> {
	return new Promise((resolve) => {
		let result: true | string;

		if (cache[key] === undefined) cache[key] = {};

		if (cache[key][value] === undefined) {
			result = counter % 2 === 0 ? true : errorMessage;
			cache[key][value] = result;
			counter += 1;

			setTimeout(() => resolve(result), SIMULATED_LATENCY_MS);
		} else {
			result = cache[key][value];
			resolve(result);
		}
	});
}
