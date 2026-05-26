export function inRange(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function safeCastNumber<DefaultValue>(
	input: unknown,
	defaultValue: DefaultValue,
): number | DefaultValue {
	try {
		const number = Number(input);

		if (input === undefined || input === null || Number.isNaN(number) || number === Infinity) {
			return defaultValue;
		}

		return number;
	} catch (_) {
		return defaultValue;
	}
}

export function formatDecimalNumber(decimalNumber: number, numberOfDecimals: number): number {
	const output = Number(decimalNumber.toFixed(numberOfDecimals));

	if (Number.isNaN(output)) {
		return 0;
	}

	return output;
}
