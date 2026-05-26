import { isArray, isBrowser, isPlainObject, isServer } from "../validator";
import type { BrowserStorage, BrowserStorageState, BrowserStorageStateConfig } from "./types";

const BrowserStorageManager = {
	createItem: function createItem<ValueType>({
		key,
		value,
		saveDuringCreation = false,
		readInitialValueFromStorage = false,
		storage = "localStorage",
	}: BrowserStorageStateConfig<ValueType>): BrowserStorageState<ValueType> {
		if (isBrowser()) {
			const storageValue = getItem<ValueType>({ key, type: typeof value, storage });
			const itemDoesNotExist = storageValue === null;
			const itemExists = itemDoesNotExist === false;
			const shouldReadInitialValueFromStorage = readInitialValueFromStorage === true && itemExists;

			if (!shouldReadInitialValueFromStorage && saveDuringCreation && itemDoesNotExist) {
				setItem(key, value, storage);
			}
		}

		return {
			get: (): ValueType => {
				if (isServer()) return value;

				// TODO: Try to not use 'as'
				const valueFromStorage = getItem({ key, type: typeof value, storage }) as ValueType;
				return valueFromStorage === null ? value : valueFromStorage;
			},

			set: (newValue: ValueType): void => {
				if (isServer()) return;

				setItem(key, newValue, storage);
			},

			remove: (): void => {
				if (isServer()) return;

				window[storage].removeItem(key);
			},

			exists: (): boolean => {
				if (isServer()) return false;

				return window[storage].getItem(key) !== null;
			},
		};
	},
};

export default BrowserStorageManager;

// --- UTILS ---

function setItem(key: string, newValue: unknown, storage: BrowserStorage): void {
	try {
		if (isPlainObject(newValue) || isArray(newValue)) {
			window[storage].setItem(key, JSON.stringify(newValue));
		} else {
			window[storage].setItem(key, String(newValue));
		}
	} catch (error) {
		console.warn(error);
		window[storage].removeItem(key);
	}
}

type GetItemParams = {
	key: string;
	type: string | number | boolean | unknown[] | Record<string, unknown>;
	storage: BrowserStorage;
};

function getItem<ValueType>({
	key,
	type,
	storage,
}: GetItemParams): GetItemParams["type"] | null | ValueType {
	const value = window[storage].getItem(key);

	try {
		if (value === null) {
			return value;
		}

		if (type === "boolean") {
			if (value === "true") return true;
			if (value === "false") return false;
		}

		if (type === "number") {
			return Number(value);
		}

		if (type === "object") {
			return JSON.parse(value);
		}

		return value;
	} catch (error) {
		console.warn(error);
		window[storage].removeItem(key);

		return value;
	}
}
