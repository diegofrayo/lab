import * as R from "remeda";

// --- USUAL FP FUNCTIONS ---

export const { pipe } = R;

// --- UTILS ---

export const is = <Input>(input: Input, options: Input[]): boolean => {
	return options.includes(input);
};

// --- ARRAY UTILITIES ---

export const map =
	<ArrayElement, ReturnElement = ArrayElement>(
		mapper: (element: ArrayElement) => ReturnElement,
	): ((arr: ArrayElement[]) => ReturnElement[]) =>
	(arr: ArrayElement[]): ReturnElement[] =>
		arr.map(mapper);

export const filter =
	(predicate: () => boolean): (<ArrayElement>(arr: ArrayElement[]) => ArrayElement[]) =>
	<ArrayElement>(arr: ArrayElement[]): ArrayElement[] =>
		arr.filter(predicate);

export const slice =
	<ArrayElement>(...args: number[]): ((arr: ArrayElement[]) => ArrayElement[]) =>
	(arr: ArrayElement[]): ArrayElement[] =>
		arr.slice(...args);

export const join =
	(string: string): (<ArrayElement>(arr: ArrayElement[]) => string) =>
	<ArrayElement>(arr: ArrayElement[]): string =>
		arr.join(string);

export const sort =
	<ArrayElement>(
		sortFn: (a: ArrayElement, b: ArrayElement) => number,
	): ((arr: ArrayElement[]) => ArrayElement[]) =>
	(arr: ArrayElement[]): ArrayElement[] =>
		[...arr].sort(sortFn);

export const push =
	<ArrayElement>(element: ArrayElement): ((arr: ArrayElement[]) => ArrayElement[]) =>
	(arr: ArrayElement[]): ArrayElement[] =>
		[...arr].concat([element]);

export const unshift =
	<ArrayElement>(element: ArrayElement): ((arr: ArrayElement[]) => ArrayElement[]) =>
	(arr: ArrayElement[]): ArrayElement[] =>
		[element].concat(arr);

export const get = <ArrayElement>(arr: ArrayElement[], index: number): ArrayElement | undefined =>
	arr[index];

export const removeLastItem = <ArrayElement>(arr: ArrayElement[]): ArrayElement[] =>
	arr.slice(0, arr.length - 1);
