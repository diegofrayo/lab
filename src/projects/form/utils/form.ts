import type { AnyFieldApi } from "@tanstack/react-form";
import { z, type ZodSafeParseResult } from "zod";

import type {
	FieldStatus,
	FormInputName,
	FormScope,
	FormValues,
	Step3Values,
	Step4Values,
} from "./types";

const VALID_INPUT = true;
type VALID_INPUT = true;
type ERROR_MESSAGE = string;
const TSF_VALID_INPUT = undefined;
type TSF_VALID_INPUT = undefined;

type CustomValidation<InputValue, FormValues> = (
	inputValue: InputValue,
	formValues: FormValues,
) => ERROR_MESSAGE | VALID_INPUT;

export const CustomValidations = {
	step3: {
		collegeName: (
			collegeName: string | undefined,
			formValues: Step3Values,
		): ERROR_MESSAGE | VALID_INPUT => {
			if (!formValues.hasCollegeDegree) return VALID_INPUT;

			return validateField(formSchema.shape.collegeName, collegeName);
		},
	},
	step4: {
		endDate: (endDate: string | undefined, formValues: Step4Values): ERROR_MESSAGE | VALID_INPUT => {
			if (formValues.stillStudying) return VALID_INPUT;

			const validationResult = validateField(formSchema.shape.endDate, endDate);

			if (validationResult !== VALID_INPUT) {
				return validationResult;
			}

			if (formValues.startDate && endDate && endDate <= formValues.startDate) {
				return "End date must be after start date";
			}

			return VALID_INPUT;
		},
	},
};

/**
 * Single source of truth for the full form. `react-hook-form` handles per-step
 * validation; this schema validates the aggregate `formValues` object when the
 * user submits the last step.
 *
 * As steps 2–4 gain fields, extend this object and the derived `FormValues`
 * type (in `types.ts`) follows automatically.
 */
const baseFormSchema = z.object({
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
		.max(60, "College name must be at most 60 characters")
		.optional(),
	startDate: z
		.string()
		.nonempty("Start date is required")
		.regex(/^\d{4}\/\d{2}\/\d{2}$/, "Date must be in yyyy/mm/dd format"),
	stillStudying: z.boolean(),
	endDate: z
		.string()
		.nonempty("End date is required")
		.regex(/^\d{4}\/\d{2}\/\d{2}$/, "Date must be in yyyy/mm/dd format")
		.optional(),
});

/**
 * `formSchema` validates each field in isolation, so it can't express the
 * "collegeName is required only when hasCollegeDegree is checked" rule
 * (needed for the aggregate check in step 4). `superRefine` layers that
 * cross-field rule on top without turning `formSchema` itself into a
 * `ZodEffects`, which would break the `formSchema.shape.<field>` lookups
 * other steps rely on for per-field validation.
 */
export const formSchema = baseFormSchema.superRefine((values, ctx) => {
	const { collegeName, endDate } = values;

	const collegeNameValidationResult = CustomValidations.step3.collegeName(collegeName, values);
	if (collegeNameValidationResult !== VALID_INPUT) {
		ctx.addIssue({ code: "custom", message: collegeNameValidationResult });
	}

	const endDateValidationResult = CustomValidations.step4.endDate(endDate, values);
	if (endDateValidationResult !== VALID_INPUT) {
		ctx.addIssue({ code: "custom", message: endDateValidationResult });
	}
});

export function parseForm(formValues: Record<string, unknown>): ZodSafeParseResult<FormValues> {
	// NOTE: Clean optional default values to avoid unexpected validations errors
	const OPTIONAL_FIELDS: FormInputName[] = ["collegeName", "endDate"] as const;
	OPTIONAL_FIELDS.forEach((fieldName) => {
		if (!formValues[fieldName]) formValues[fieldName] = undefined;
	});

	return formSchema.safeParse(formValues);
}

/**
 * Validates a single value against a field schema, shaped for a
 * `react-hook-form` `validate` rule: returns `VALID_INPUT` when valid, otherwise the
 * first zod error message. Lets each step reuse the schema above as the single
 * source of truth instead of re-declaring the same rules inline.
 */
function validateField(fieldSchema: z.ZodType, value: unknown): VALID_INPUT | ERROR_MESSAGE {
	const result = fieldSchema.safeParse(value);
	return result.success ? VALID_INPUT : (result.error.issues[0]?.message ?? "Invalid value");
}

/**
 * Derives a field's visual status from its react-hook-form state. Shared across
 * steps so every field reports valid/invalid/neutral the same way.
 */
export function getFieldStatus({
	hasError,
	hasValue,
	isFormSubmitted,
	isTouched,
	isValidating,
}: {
	hasError: boolean;
	hasValue: boolean;
	isFormSubmitted?: boolean;
	isTouched: boolean;
	isValidating?: boolean;
}): FieldStatus {
	if (hasError) return "invalid";
	if ((isTouched || isFormSubmitted) && hasValue && !isValidating) return "valid";
	return "neutral";
}

export function composeLocalStorageKeyForInput(scope: FormScope, inputName: string): string {
	return `${scope}:form:input:${inputName}`;
}

/**
 * `formSchema` stores dates as `yyyy/mm/dd`, but a native `<input type="date">`
 * only accepts/emits `yyyy-mm-dd`. These convert between the two at the DOM
 * boundary so the rest of the form (validation, persistence, submission) can
 * keep treating `yyyy/mm/dd` as the single source of truth.
 */
export function toHtmlDateValue(value: string): string {
	return value.replaceAll("/", "-");
}

export function fromHtmlDateValue(value: string): string {
	return value.replaceAll("-", "/");
}

// --- RHF Utils ---

export function createRHFInputValidator<InputValue>(inputShape: z.ZodType) {
	return function validator(value: InputValue): ERROR_MESSAGE | VALID_INPUT {
		return validateField(inputShape, value);
	};
}

// --- TSF Utils ---

export function createTSFValidatorFromInputShape<InputValue>(inputShape: z.ZodType) {
	return function validator({ value }: { value: InputValue }): ERROR_MESSAGE | TSF_VALID_INPUT {
		const result = validateField(inputShape, value);
		return result === true ? TSF_VALID_INPUT : result;
	};
}

export function createTSFValidatorFromCustomValidation<InputValue, FormValues>(
	customValidation: CustomValidation<InputValue, FormValues>,
) {
	return function validator({
		value,
		fieldApi,
	}: {
		value: InputValue;
		fieldApi: AnyFieldApi;
	}): ERROR_MESSAGE | TSF_VALID_INPUT {
		const result = customValidation(value, fieldApi.form.state.values as FormValues);
		return result === true ? TSF_VALID_INPUT : result;
	};
}

export function clearPersistedInputs(scope: FormScope, inputNames: FormInputName[]): void {
	inputNames.forEach((inputName) => {
		window.localStorage.removeItem(composeLocalStorageKeyForInput(scope, inputName));
	});
}

export function getFieldMessageId(inputId: string): string {
	return `${inputId}-message`;
}
