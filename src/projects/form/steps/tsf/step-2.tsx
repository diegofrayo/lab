"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { useForm, useSelector } from "@tanstack/react-form";
import { toast } from "sonner";

import Form from "../../components/form";
import Label from "../../components/primitive/label";
import Select from "../../components/primitive/select";
import type { SelectOption } from "../../components/primitive/select";
import { useFormNavigation } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	clearPersistedInputs,
	createTSFValidatorFromInputShape,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import type { Step2Values, TSFValidationRules } from "../../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const { form, onSubmit, stateOptions, cityOptions, handleStateChange } = useStep2Form();

	// --- COMPUTED STATES ---
	const isCityDisabled = cityOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<form.Field
					name="state"
					validators={ValidationRules.state}
				>
					{(field) => {
						const stateStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
						});

						function handleValueChange(value: string | null): void {
							field.handleChange(value ?? "");
							handleStateChange();
						}

						return (
							<Form.Field>
								<Label
									htmlFor="state"
									data-state={stateStatus}
								>
									State
								</Label>
								<Select
									id="state"
									aria-describedby={getFieldMessageId("state")}
									data-state={stateStatus}
									items={stateOptions}
									placeholder="Select a state"
									value={field.state.value || null}
									onBlur={field.handleBlur}
									onValueChange={handleValueChange}
								/>
								<Form.FieldMessage
									inputId="state"
									status={stateStatus}
								>
									{field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
				</form.Field>

				<form.Field
					name="city"
					validators={ValidationRules.city}
				>
					{(field) => {
						const cityStatus = getFieldStatus({
							hasError: field.state.meta.errors.length > 0,
							isTouched: field.state.meta.isTouched,
							hasValue: Boolean(field.state.value),
						});

						return (
							<Form.Field>
								<Label
									htmlFor="city"
									data-state={cityStatus}
								>
									City
								</Label>
								<Select
									id="city"
									aria-describedby={getFieldMessageId("city")}
									data-state={cityStatus}
									items={cityOptions}
									placeholder="Select a city"
									disabled={isCityDisabled}
									value={field.state.value || null}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value ?? "")}
								/>
								<Form.FieldMessage
									inputId="city"
									status={cityStatus}
								>
									{field.state.meta.errors[0]}
								</Form.FieldMessage>
							</Form.Field>
						);
					}}
				</form.Field>
			</Form.Body>

			<Form.Navigation />
		</Form>
	);
}

export default Step2;

// --- CONTROLLER ---

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- the form API's return type has too many generic parameters to spell out usefully
function useStep2Form() {
	// --- HOOKS ---
	const { stateOptions, getCitiesOptions } = useColombiaLocations();
	const { scope, updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: (keyof Step2Values)[] = useMemo(() => ["state", "city"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		onSubmit: ({ value }) => {
			updateFormValues(value);
			clearPersistedInputs(scope, FORM_INPUTS_NAME);
			goToNextStep();
		},
	});

	// --- HANDLERS ---
	function onSubmit(event?: React.SubmitEvent): void {
		event?.preventDefault();
		event?.stopPropagation();
		void form.handleSubmit();
	}

	function handleStateChange(): void {
		form.setFieldValue("city", "");
	}

	// --- COMPUTED STATES ---
	const formValues = useSelector(form.store, (state) => state.values);
	const cityOptions = formValues.state ? getCitiesOptions(formValues.state) : [];

	// --- EFFECTS ---
	usePersistInput("state", formValues.state);
	usePersistInput("city", formValues.city);

	return { form, onSubmit, stateOptions, cityOptions, handleStateChange };
}

// --- VALIDATION RULES ---

const ValidationRules = {
	state: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.state),
	},
	city: {
		onChange: createTSFValidatorFromInputShape(formSchema.shape.city),
	},
} satisfies TSFValidationRules<Step2Values>;

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
		void loadStatesData(); // eslint-disable-line react-hooks/set-state-in-effect
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
