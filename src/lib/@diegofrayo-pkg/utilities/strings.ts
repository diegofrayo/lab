import { isArray } from "../validator/validator";
import { createArray } from "./arrays-and-objects";

export function generateSlug(str: string): string {
	let result = str.replace(/^\s+|\s+$/g, "").toLowerCase();

	result = removeAccents(result)
		.replace(/[^a-z0-9 -]/g, "") // remove invalid chars
		.replace(/\s+/g, "-") // collapse whitespace and replace by -
		.replace(/-+/g, "-"); // collapse dashes

	return result;
}

export function removeAccents(input: string): string {
	const FROM = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
	const TO = "aaaaeeeeiiiioooouuuunc------";
	let result = input;

	createArray(FROM.length).forEach((i) => {
		result = replaceAll(result, FROM.charAt(i), TO.charAt(i));
	});

	return result;
}

export function replaceAll(str: string, toReplace: string | string[], replacement: string): string {
	if (isArray(toReplace)) {
		return toReplace.reduce(
			(result, item) => result.replace(new RegExp(escapeRegExp(item), "g"), replacement),
			str,
		);
	}

	return str.replace(new RegExp(escapeRegExp(toReplace), "g"), replacement);
}

export function generateRandomString(length: number): string {
	const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const charactersLength = CHARACTERS.length;

	const result = createArray(length).reduce((result) => {
		return result + CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
	}, "");

	return result.toUpperCase();
}

export function addLeftPadding(number: number): string {
	return String(number).padStart(2, "0");
}

export function capitalize(input: string): string {
	return (input[0] || "").toUpperCase() + input.slice(1);
}

export function join(items: string[], separator?: string): string {
	return items.join(separator || "");
}

// --- UTILS ---

function escapeRegExp(text: string): string {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
