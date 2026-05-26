export type BrowserStorage = "sessionStorage" | "localStorage";

export type BrowserStorageStateConfig<ValueType> = {
	key: string;
	value: ValueType;
	saveDuringCreation?: boolean;
	readInitialValueFromStorage?: boolean;
	storage?: BrowserStorage;
};

export type BrowserStorageState<ValueType> = {
	get: () => ValueType;
	set: (newValue: ValueType) => void;
	remove: () => void;
	exists: () => boolean;
};
