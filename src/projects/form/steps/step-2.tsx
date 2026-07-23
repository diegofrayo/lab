"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { toast } from "sonner";

import Form from "../components/form";
import Label from "../components/primitive/label";
import Select from "../components/primitive/select";
import type { SelectOption } from "../components/primitive/select";
import { useFormNavigation } from "../context/form.hook";
import { useFormSubmitted } from "../hooks/use-form-submitted";
import { usePersistInput } from "../hooks/use-persist-input";
import { formSchema, getFieldStatus, validateField } from "../utils/form";
import type { FormInputName, Step2Values, StepFormReturn } from "../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields },
		stateOptions,
		cityOptions,
		handleStateChange,
		onSubmit,
	} = useStep2Form();

	// --- COMPUTED STATES ---
	const stateStatus = getFieldStatus({
		hasError: Boolean(errors.state),
		isTouched: Boolean(dirtyFields.state) || Boolean(touchedFields.state),
		hasValue: Boolean(formValues.state),
	});
	const cityStatus = getFieldStatus({
		hasError: Boolean(errors.city),
		isTouched: Boolean(dirtyFields.city) || Boolean(touchedFields.city),
		hasValue: Boolean(formValues.city),
	});
	const isCityDisabled = cityOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="state"
						data-state={stateStatus}
					>
						State
					</Label>
					<Controller
						name="state"
						control={control}
						rules={STATE_RULES}
						render={({ field }) => {
							function handleStateValueChange(value: string | null): void {
								field.onChange(value);
								handleStateChange(value);
							}

							return (
								<Select
									id="state"
									data-state={stateStatus}
									items={stateOptions}
									placeholder="Select a state"
									value={field.value || null}
									ref={field.ref}
									onBlur={field.onBlur}
									onValueChange={handleStateValueChange}
								/>
							);
						}}
					/>
					<Form.FieldMessage status={stateStatus}>{errors.state?.message}</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="city"
						data-state={cityStatus}
					>
						City
					</Label>
					<Controller
						name="city"
						control={control}
						rules={CITY_RULES}
						render={({ field }) => (
							<Select
								id="city"
								data-state={cityStatus}
								items={cityOptions}
								placeholder="Select a city"
								disabled={isCityDisabled}
								value={field.value || null}
								ref={field.ref}
								onBlur={field.onBlur}
								onValueChange={field.onChange}
							/>
						)}
					/>
					<Form.FieldMessage status={cityStatus}>{errors.city?.message}</Form.FieldMessage>
				</Form.Field>
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step2;

// --- CONTROLLER ---

type UseStep2FormReturn = StepFormReturn<Step2Values> & {
	control: Control<Step2Values>;
	stateOptions: SelectOption[];
	cityOptions: SelectOption[];
	handleStateChange: (stateId: string | null) => void;
};

function useStep2Form(): UseStep2FormReturn {
	// --- HOOKS ---
	const { stateOptions, getCitiesOptions } = useColombiaLocations();
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["state", "city"], []);
	const DEFAULT_VALUES = useMemo(() => getDefaultValues(FORM_INPUTS_NAME), [FORM_INPUTS_NAME]);
	const form = useForm<Step2Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- STATES & REFS ---
	const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
	});

	function handleStateChange(stateId: string | null): void {
		form.setValue("city", "", { shouldValidate: true, shouldDirty: true });
		setCityOptions(stateId ? getCitiesOptions(stateId) : []);
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("state", formValues.state);
	usePersistInput("city", formValues.city);
	useFormSubmitted(FORM_INPUTS_NAME, form.formState.isSubmitSuccessful, goToNextStep);

	useEffect(
		function restoreCityOptions() {
			const stateId = form.getValues("state");

			if (!stateId) return;

			setCityOptions(getCitiesOptions(stateId));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[stateOptions],
	);

	return {
		...form,
		formValues,
		onSubmit,
		stateOptions,
		cityOptions,
		handleStateChange,
	};
}

// --- VALIDATION RULES ---

const STATE_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.state, value),
	},
};

const CITY_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.city, value),
	},
};

// --- HOOKS ---

const COLOMBIA_STORAGE_KEY = "data:colombia-locations";

type RawColombiaStateItem = {
	id: number;
	departamento: string;
	ciudades: string[];
};

type UseColombiaLocationsReturn = {
	stateOptions: SelectOption[];
	getCitiesOptions: (stateId: string) => SelectOption[];
};

/**
 * Loads the Colombia states/cities dataset once and caches it in
 * `localStorage`. The dataset itself is never kept in memory (no state or
 * module-level variable holds the full array) — every cities lookup reads
 * it back from storage on demand, and the cache is cleared when step 2
 * unmounts.
 */
function useColombiaLocations(): UseColombiaLocationsReturn {
	// --- STATES & REFS ---
	const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);

	// --- UTILS ---
	function getCitiesOptions(stateId: string): SelectOption[] {
		const states = readColombiaDataFromStorage();
		const state = states.find((item) => String(item.id) === stateId);

		return (state?.ciudades ?? []).map(toCityOption);
	}

	async function loadStatesData(): Promise<void> {
		try {
			const states = await fetchColombiaData();
			setStateOptions(states.map(toStateOption));
		} catch (error) {
			toast.error("Something went wrong loading the items, please try again.");
		}
	}

	// --- EFFECTS ---
	useEffect(function loadStates() {
		loadStatesData(); // eslint-disable-line react-hooks/set-state-in-effect
	}, []);

	useEffect(function clearColombiaStorageOnUnmount() {
		return function cleanup(): void {
			window.localStorage.removeItem(COLOMBIA_STORAGE_KEY);
		};
	}, []);

	return { stateOptions, getCitiesOptions };
}

async function fetchColombiaData(): Promise<RawColombiaStateItem[]> {
	const cached = readColombiaDataFromStorage();

	if (cached.length > 0) {
		return cached;
	}

	const response = await fetch("/projects/form/json/colombia.min.json");
	const states = (await response.json()) as RawColombiaStateItem[];

	window.localStorage.setItem(COLOMBIA_STORAGE_KEY, JSON.stringify(states));

	return states;
}

function readColombiaDataFromStorage(): RawColombiaStateItem[] {
	const raw = window.localStorage.getItem(COLOMBIA_STORAGE_KEY);

	if (!raw) return [];

	return JSON.parse(raw) as RawColombiaStateItem[];
}

function toStateOption(state: RawColombiaStateItem): SelectOption {
	return { label: state.departamento, value: String(state.id) };
}

function toCityOption(city: string): SelectOption {
	return { label: city, value: city };
}
