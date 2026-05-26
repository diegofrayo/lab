/*
 * Inspiration:
 * - https://github.com/kibertoad/validation-utils
 * - https://validatejs.org
 * - https://github.com/anonym101/x-utils-es
 * - https://landau.github.io/predicate/#predicates
 */

// --- PRIMITIVES ---

export function isString(input: unknown): input is string {
	return typeof input === "string";
}

export function isNumber(input: unknown): input is number {
	return typeof input === "number";
}

export function isBoolean(input: unknown): input is boolean {
	return typeof input === "boolean";
}

export function isDate(input: unknown): input is Date {
	return input instanceof Date;
}

export function isNull(input: unknown): input is null {
	return input === null;
}

export function isUndefined(input: unknown): input is undefined {
	return typeof input === "undefined";
}

export function isObject(input: unknown): input is object {
	return typeof input === "object";
}

export function isPlainObject<InputType = Record<string | number | symbol, unknown>>(
	input: unknown,
): input is InputType {
	if (isNil(input) || isArray(input)) return false;

	return typeof input === "object";
}

export function isArray<ItemsType = unknown>(input: unknown): input is ItemsType[] {
	return Array.isArray(input);
}

export function isArrayOf<ItemsType>(input: unknown, type: "string"): input is ItemsType[] {
	return Array.isArray(input) && input.every((item) => typeof item === type);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction<InputType = Function>(input: unknown): input is InputType {
	return isUndefined(input) === false && typeof input === "function";
}

// --- STRINGS ---

export function isEmptyString(input: unknown): boolean {
	return typeof input === "string" && input.trim().length === 0;
}

export function isNotEmptyString(input: unknown): input is string {
	return typeof input === "string" && input.trim().length > 0;
}

// --- BOOLEANS ---

export function isTrue(input: unknown): input is boolean {
	return input === true;
}

export function isFalse(input: unknown): input is boolean {
	return input === false;
}

// --- ARRAYS ---

export function isEmptyArray(input: unknown): boolean {
	return isArray(input) && input.length === 0;
}

export function isNotEmptyArray(input: unknown): input is unknown[] {
	return isArray(input) && input.length > 0;
}

// --- OBJECTS ---

export function isEmptyObject(input: unknown): input is object {
	return (
		isObject(input) &&
		Object.keys(input).length === 0 &&
		Object.getPrototypeOf(input) === Object.prototype
	);
}

// --- SEMANTICS ---

export function isEmpty(input: unknown): boolean {
	return isEmptyString(input) || isEmptyObject(input) || isEmptyArray(input);
}

export function isNil(input: unknown): input is null | undefined {
	return input === null || input === undefined;
}

export function isNotNil(input: unknown): boolean {
	return input !== null && input !== undefined;
}

export function isFalsy(input: unknown): boolean {
	return !input;
}

export function isEqual(input1: unknown, input2: unknown): boolean {
	return input1 === input2;
}

// --- VALUES ---

export function isEmail(email: unknown): email is string {
	return (
		String(email)
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			) !== null
	);
}

// --- ENVIRONMENT ---

export function isBrowser(): boolean {
	return typeof window !== "undefined";
}

export function isServer(): boolean {
	return !isBrowser();
}

// --- OTHERS ---

export function isBlob(input: unknown): input is Blob {
	return input instanceof Blob;
}
