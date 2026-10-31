export function getRandomNumber(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function getRandomInteger(min: number, max: number): number {
	return Math.floor(getRandomNumber(min, max + 1));
}

export function roundToCents(value: number): number {
	return Math.round(value * 100) / 100;
}
