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

/**
 * Debounces `func`. Every call made during one burst returns the same promise,
 * which settles with the result of the last call once `delay` has passed. That
 * way a superseded call never hangs: it resolves with the latest result.
 */
export function debounce<Args extends unknown[], Return>(
	func: (...args: Args) => Return,
	delay: number,
): (...args: Args) => Promise<Awaited<Return>> {
	let timer: ReturnType<typeof setTimeout>;
	let pending: PromiseWithResolvers<Awaited<Return>> | null = null;

	return function (this: unknown, ...args: Args) {
		clearTimeout(timer);

		const current = pending ?? Promise.withResolvers<Awaited<Return>>();
		pending = current;

		timer = setTimeout(() => {
			pending = null;

			try {
				Promise.resolve(func.apply(this, args)).then(current.resolve, current.reject);
			} catch (error) {
				current.reject(error);
			}
		}, delay);

		return current.promise;
	};
}
