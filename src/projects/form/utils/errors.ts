export function getErrorMessage(error: unknown, customMessage?: string): string {
	return error instanceof Error ? error.message : customMessage || "Something went wrong.";
}
