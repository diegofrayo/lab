/* eslint @typescript-eslint/no-namespace: 0 */

declare namespace UtilsTypes {
	// --- DATA ---
	type GenericObject<PropertyValues = unknown> = Record<string | number | symbol, PropertyValues>;

	export type Primitive = string | number | boolean | null;

	export type Object<PropertyValues = unknown> = GenericObject<PropertyValues>;

	export type JSON = GenericObject<
		string | number | boolean | null | JSON[] | { [key: string]: JSON }
	>;

	// --- JS ---
	export type SetTimeout = NodeJS.Timeout;
	export type ProcessEnv = NodeJS.ProcessEnv;

	// --- DATES ---
	export namespace Dates {
		type OneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
		type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
		type YYYY = `19${ZeroToNine}${ZeroToNine}` | `20${ZeroToNine}${ZeroToNine}`;
		type MM = `0${OneToNine}` | `1${0 | 1 | 2}`;
		type DD = `${0}${OneToNine}` | `${1 | 2}${ZeroToNine}` | `3${0 | 1}`;

		export type DateString<Config = "DATE"> = Config extends "FULL"
			? `${YYYY}-${MM}-${DD}T:00:00:00`
			: `${YYYY}-${MM}-${DD}`;
	}
}

type NonNullableObject<T> = {
	[P in keyof T]: NonNullable<T[P]>;
};

export type { UtilsTypes as default, NonNullableObject };
