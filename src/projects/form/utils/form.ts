export function getFieldState(
	isValid: boolean,
	hasError: boolean,
): "valid" | "invalid" | undefined {
	if (hasError) return "invalid";
	if (isValid) return "valid";
	return undefined;
}
