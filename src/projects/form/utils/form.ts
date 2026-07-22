import type { FieldStatus } from "./types";

/**
 * Derives a field's visual status from its react-hook-form state. Shared across
 * steps so every field reports valid/invalid/neutral the same way.
 */
export function getFieldStatus({
	hasError,
	isTouched,
	hasValue,
}: {
	hasError: boolean;
	isTouched: boolean;
	hasValue: boolean;
}): FieldStatus {
	if (hasError) return "INVALID";
	if (isTouched && hasValue) return "VALID";
	return "NEUTRAL";
}

/**
 * Maps a `FieldStatus` to the `data-state` value consumed by the primitive
 * `Input`/`Label` components. The primitives match `data-[state=valid|invalid]`
 * (lowercase, case-sensitive), so it's lowercased here; neutral fields carry no
 * attribute.
 */
export function toDataState(status: FieldStatus): "valid" | "invalid" | undefined {
	if (status === "VALID") return "valid";
	if (status === "INVALID") return "invalid";
	return undefined;
}
