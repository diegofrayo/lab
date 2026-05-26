export function waitFor(time: number, unit: "miliseconds" | "seconds"): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, unit === "miliseconds" ? time : time * 1000);
	});
}

// NOTE: References: https://es-toolkit.slash.page/reference/util/attemptAsync.html
export async function attemptAsync<Return>(
	callback: () => Return,
): Promise<[Awaited<PromiseLike<Return>>, undefined] | [undefined, Error]> {
	try {
		const response = await callback();
		return [response, undefined];
	} catch (error) {
		return [undefined, error as Error];
	}
}

// NOTE: References: https://es-toolkit.slash.page/reference/util/attempt.html
export function attempt<Return>(callback: () => Return): [Return, undefined] | [undefined, Error] {
	try {
		const response = callback();
		return [response, undefined];
	} catch (error) {
		return [undefined, error as Error];
	}
}

export async function resolvePromisesSequentially<ArrayElement>(
	tasks: (() => ArrayElement | Promise<ArrayElement>)[],
): Promise<Array<ArrayElement>> {
	return tasks.reduce(
		async (resultPromised, task) => {
			const result = await resultPromised;
			const taskResult = await task();
			return result.concat([taskResult]);
		},
		Promise.resolve([] as ArrayElement[]),
	);
}

export async function asyncLoop<ArrayElement>(
	array: Array<ArrayElement>,
	callback: (arg: ArrayElement, index: number) => Promise<unknown>,
): Promise<void> {
	let index = 0;

	for (const item of array) {
		await callback(item, index);
		index += 1;
	}
}
