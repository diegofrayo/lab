import { isString } from "../validator";

export function throwError(message: string): never {
	throw new Error(message);
}

export function getErrorMessage(error: unknown, defaultMessage?: string): string {
	if (isHttpError(error)) {
		return error.response.data.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return defaultMessage || "Unknown error";
}

// --- UTILS ---

type HttpError = { response: { data: { message: string } } };

function isHttpError(error: unknown): error is HttpError {
	return isString((error as HttpError)?.response?.data?.message);
}
