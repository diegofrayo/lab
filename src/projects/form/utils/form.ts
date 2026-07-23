import { z } from "zod";

import type { FieldStatus } from "./types";

/**
 * Single source of truth for the full form. `react-hook-form` handles per-step
 * validation; this schema validates the aggregate `formValues` object when the
 * user submits the last step.
 *
 * As steps 2–4 gain fields, extend this object and the derived `FormValues`
 * type (in `types.ts`) follows automatically.
 */
export const formSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(40, "Name must be at most 40 characters"),
	email: z.email("Enter a valid email").max(30, "Email must be at most 30 characters"),
	username: z
		.string()
		.trim()
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must be at most 20 characters")
		.regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, - and _"),
	state: z.string().trim().min(1, "State is required"),
	city: z.string().trim().min(1, "City is required"),
	hasCollegeDegree: z.boolean(),
	collegeName: z
		.string()
		.trim()
		.min(1, "College name is required")
		.max(60, "College name must be at most 60 characters"),
});

/**
 * `formSchema` validates each field in isolation, so it can't express the
 * "collegeName is required only when hasCollegeDegree is checked" rule
 * (needed for the aggregate check in step 4). `superRefine` layers that
 * cross-field rule on top without turning `formSchema` itself into a
 * `ZodEffects`, which would break the `formSchema.shape.<field>` lookups
 * other steps rely on for per-field validation.
 */
export const fullFormSchema = formSchema.superRefine((values, ctx) => {
	if (values.hasCollegeDegree) {
		const validationResult = validateField(formSchema.shape.collegeName, values.collegeName);

		if (validationResult !== true) {
			ctx.addIssue({
				code: "custom",
				message: validationResult,
				path: ["collegeName"],
			});
		}
	}
});

/**
 * Derives a field's visual status from its react-hook-form state. Shared across
 * steps so every field reports valid/invalid/neutral the same way.
 */
export function getFieldStatus({
	hasError,
	isTouched,
	hasValue,
	isValidating,
}: {
	hasError: boolean;
	isTouched: boolean;
	hasValue: boolean;
	isValidating?: boolean;
}): FieldStatus {
	if (hasError) return "invalid";
	if (isTouched && hasValue && !isValidating) return "valid";
	return "neutral";
}

/**
 * Validates a single value against a field schema, shaped for a
 * `react-hook-form` `validate` rule: returns `true` when valid, otherwise the
 * first zod error message. Lets each step reuse the schema above as the single
 * source of truth instead of re-declaring the same rules inline.
 */
export function validateField(fieldSchema: z.ZodType, value: unknown): true | string {
	const result = fieldSchema.safeParse(value);
	return result.success ? true : (result.error.issues[0]?.message ?? "Invalid value");
}

export function composeLocalStorageKeyForInput(inputName: string): string {
	return `input:${inputName}`;
}
