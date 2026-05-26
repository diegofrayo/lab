import { isEmptyString, isUndefined } from "../../validator";

export async function copyToClipboard(text: string): Promise<void> {
	try {
		if (isUndefined(navigator.clipboard)) {
			throw new Error("Clipboard not supported");
		}

		if (isEmptyString(text)) {
			throw new Error("Any text was selected to copy");
		}

		await navigator.clipboard.writeText(text);
	} catch (error) {
		console.error(error);
	}
}
