import type { AnyFieldApi } from "@tanstack/react-form";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
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

type CustomValidation<InputValue, StepValues> = (
	inputValue: InputValue,
	formValues: StepValues,
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

export function parseForm(formValues: Partial<FormValues>): ZodSafeParseResult<FormValues> {
	// NOTE: Clean optional default values to avoid unexpected validations errors.
	// Work on a copy so the caller's object is never mutated.
	const values: Record<string, unknown> = { ...formValues };
	const OPTIONAL_FIELDS: FormInputName[] = ["collegeName", "endDate"];
	OPTIONAL_FIELDS.forEach((fieldName) => {
		if (!values[fieldName]) values[fieldName] = undefined;
	});

	return formSchema.safeParse(values);
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

type GetFieldStatusParams = {
	hasError: boolean;
	hasValue: boolean;
	isFormSubmitted: boolean;
	isTouched: boolean;
	isValidating: boolean;
};

/**
 * Derives a field's visual status. Only called through `getRHFFieldStatus` and
 * `getTSFFieldStatus`, so both libraries decide "valid" the same way.
 */
function getFieldStatus({
	hasError,
	hasValue,
	isFormSubmitted,
	isTouched,
	isValidating,
}: GetFieldStatusParams): FieldStatus {
	if (hasError) return "invalid";
	if ((isTouched || isFormSubmitted) && hasValue && !isValidating) return "valid";
	return "neutral";
}

/** `false` counts as a value (e.g. a "No" answer); only empty strings and missing values don't. */
function hasFieldValue(value: unknown): boolean {
	return value !== undefined && value !== null && value !== "";
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

type GetRHFFieldStatusParams<Values extends FieldValues> = {
	form: Pick<UseFormReturn<Values>, "formState" | "getFieldState" | "getValues">;
	name: Path<Values>;
};

export function getRHFFieldStatus<Values extends FieldValues>({
	form,
	name,
}: GetRHFFieldStatusParams<Values>): FieldStatus {
	const { invalid, isDirty, isTouched, isValidating } = form.getFieldState(name, form.formState);

	return getFieldStatus({
		hasError: invalid,
		hasValue: hasFieldValue(form.getValues(name)),
		isFormSubmitted: form.formState.isSubmitted,
		isTouched: isDirty || isTouched,
		isValidating,
	});
}

// --- TSF Utils ---

export function getTSFFieldStatus(field: AnyFieldApi): FieldStatus {
	return getFieldStatus({
		hasError: field.state.meta.errors.length > 0,
		hasValue: hasFieldValue(field.state.value),
		isFormSubmitted: field.form.state.isSubmitted,
		isTouched: field.state.meta.isTouched,
		isValidating: field.state.meta.isValidating,
	});
}

export function createTSFValidatorFromInputShape<InputValue>(inputShape: z.ZodType) {
	return function validator({ value }: { value: InputValue }): ERROR_MESSAGE | TSF_VALID_INPUT {
		const result = validateField(inputShape, value);
		return result === true ? TSF_VALID_INPUT : result;
	};
}

export function createTSFValidatorFromCustomValidation<InputValue, StepValues>(
	customValidation: CustomValidation<InputValue, StepValues>,
) {
	return function validator({
		value,
		fieldApi,
	}: {
		value: InputValue;
		fieldApi: AnyFieldApi;
	}): ERROR_MESSAGE | TSF_VALID_INPUT {
		const result = customValidation(value, fieldApi.form.state.values as StepValues);
		return result === true ? TSF_VALID_INPUT : result;
	};
}

/** `localStorage` key of the cached Colombia states/cities dataset used by step 2. */
export const COLOMBIA_STORAGE_KEY = "data:colombia-locations";

/** Removes every value the form saved under `scope` (submitted values, current step and per-input drafts). */
export function clearPersistedForm(scope: FormScope): void {
	const prefix = `${scope}:form:`;

	Object.keys(window.localStorage)
		.filter((key) => key.startsWith(prefix))
		.forEach((key) => window.localStorage.removeItem(key));
}

export function clearPersistedInputs(scope: FormScope, inputNames: readonly FormInputName[]): void {
	inputNames.forEach((inputName) => {
		window.localStorage.removeItem(composeLocalStorageKeyForInput(scope, inputName));
	});
}

export function getFieldMessageId(inputId: string): string {
	return `${inputId}-message`;
}
