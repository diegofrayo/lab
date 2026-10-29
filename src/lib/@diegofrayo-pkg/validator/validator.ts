/*
 * Inspiration:
 * - https://github.com/kibertoad/validation-utils
 * - https://validatejs.org
 * - https://github.com/anonym101/x-utils-es
 * - https://landau.github.io/predicate/#predicates
 */

// --- TYPES: PRIMITIVES ---

export function isString(input: unknown): input is string {
	return typeof input === "string";
}

export function isNumber(input: unknown): input is number {
	return typeof input === "number";
}

export function isBoolean(input: unknown): input is boolean {
	return typeof input === "boolean";
}

export function isNull(input: unknown): input is null {
	return input === null;
}

export function isUndefined(input: unknown): input is undefined {
	return typeof input === "undefined";
}

export function isNil(input: unknown): input is null | undefined {
	return input === null || input === undefined;
}

export function isNonNil<InputType>(input: InputType): input is NonNullable<InputType> {
	return input !== null && input !== undefined;
}

// --- TYPES: OBJECTS ---

export function isObject(input: unknown): input is object {
	return typeof input === "object" && input !== null;
}

export function isPlainObject<InputType = Record<string | number | symbol, unknown>>(
	input: unknown,
): input is InputType {
	if (!isObject(input)) return false;

	const prototype: unknown = Object.getPrototypeOf(input);

	return prototype === Object.prototype || prototype === null;
}

export function isArray<ItemsType = unknown>(input: unknown): input is ItemsType[] {
	return Array.isArray(input);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction<InputType = Function>(input: unknown): input is InputType {
	return isUndefined(input) === false && typeof input === "function";
}

export function isDate(input: unknown): input is Date {
	return input instanceof Date;
}

export function isBlob(input: unknown): input is Blob {
	return input instanceof Blob;
}

// --- VALUES: STRINGS ---

export function isEmptyString(input: unknown): boolean {
	return typeof input === "string" && input.length === 0;
}

export function isNonEmptyString(input: unknown): input is string {
	return typeof input === "string" && input.length > 0;
}

export function isBlankString(input: unknown): boolean {
	return typeof input === "string" && input.trim().length === 0;
}

export function isNonBlankString(input: unknown): input is string {
	return typeof input === "string" && input.trim().length > 0;
}

export function isEmail(input: unknown): input is string {
	return (
		isString(input) &&
		input
			.toLowerCase()
			.match(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			) !== null
	);
}

// --- VALUES: BOOLEANS ---

export function isTrue(input: unknown): input is true {
	return input === true;
}

export function isFalse(input: unknown): input is false {
	return input === false;
}

export function isFalsy(input: unknown): boolean {
	return !input;
}

// --- VALUES: ARRAYS ---

export function isEmptyArray(input: unknown): boolean {
	return isArray(input) && input.length === 0;
}

export function isNonEmptyArray(input: unknown): input is unknown[] {
	return isArray(input) && input.length > 0;
}

// --- VALUES: OBJECTS ---

export function isEmptyObject(input: unknown): input is object {
	return isPlainObject(input) && Object.keys(input).length === 0;
}

// --- VALUES: ANY ---

export function isEmpty(input: unknown): boolean {
	return isEmptyString(input) || isEmptyObject(input) || isEmptyArray(input);
}

export function isStrictEqual(input1: unknown, input2: unknown): boolean {
	return input1 === input2;
}

// --- ENVIRONMENT ---

export function isBrowser(): boolean {
	return typeof window !== "undefined";
}

export function isNonBrowser(): boolean {
	return !isBrowser();
}
