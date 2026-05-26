import { throwError } from "./errors";

export function createArray(length: number, start?: number): number[] {
	return Array.from(Array(length).keys()).map((value) => value + (start === undefined ? 1 : start));
}

export function mirror<Keys extends string, Return extends Record<Keys, Keys>>(
	elements: Keys[],
): Return {
	return elements.reduce((result, element) => ({ ...result, [element]: element }), {} as Return);
}

export function getObjectKeys<Object extends object, Return extends (keyof Object)[]>(
	object: Object,
): Return {
	return Object.keys(object) as Return;
}

export function omit<Object extends object, ObjectKeys extends keyof Object>(
	input: Object,
	keys: ObjectKeys[],
): Omit<Object, ObjectKeys> {
	const output = { ...input };

	keys.forEach((key) => {
		delete output[key];
	});

	return output;
}

export function pick<Object extends object, ObjectKeys extends keyof Object>(
	obj: Object,
	keys: ObjectKeys[],
): Pick<Object, ObjectKeys> {
	const result = {} as Pick<Object, ObjectKeys>;

	keys.forEach((key) => {
		if (key in obj) {
			result[key] = obj[key];
		}
	});

	return result;
}

export function removeDuplicates<ItemType>(array: ItemType[]): ItemType[] {
	return array.filter((item, index) => array.indexOf(item) === index);
}

export function sortObjectKeys<Object extends object, ObjectKeys extends keyof Object>(
	object: Object,
): Object {
	return Object.keys(object)
		.sort()
		.reduce((result, key) => {
			return {
				...result,
				[key]: object[key as ObjectKeys],
			};
		}, {} as Object);
}

export function getOrFail<ObjectInput extends object, ObjectKeys extends keyof ObjectInput>(
	object: ObjectInput,
	opts: { key: ObjectKeys; error: string },
): ObjectInput[ObjectKeys] {
	return object[opts.key] || throwError(opts.error);
}

export function batch<Element>(elements: Element[], batchSize: number): Array<Array<Element>> {
	const result: Element[][] = [];
	let currentBatch: Element[] = [];

	if (elements.length <= batchSize) {
		return [elements];
	}

	for (let i = 1; i <= elements.length; i += 1) {
		const currentElement = elements[i - 1];

		if (currentElement !== undefined) currentBatch.push(currentElement);

		if (i % batchSize === 0) {
			result.push(currentBatch);
			currentBatch = [];
		}
	}

	if (currentBatch.length >= 0) {
		result.push(currentBatch);
	}

	return result;
}

export function merge<Target extends object>(target: Target, updates: Partial<Target>): Target {
	return { ...target, ...updates };
}
