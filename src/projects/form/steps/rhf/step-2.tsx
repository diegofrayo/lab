"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Control, RegisterOptions } from "react-hook-form";
import { toast } from "sonner";

import Form from "../../components/form";
import Label from "../../components/primitive/label";
import Select from "../../components/primitive/select";
import type { SelectOption } from "../../components/primitive/select";
import { useFormNavigation } from "../../context/form.hook";
import { usePersistInput } from "../../hooks/use-persist-input";
import {
	clearPersistedInputs,
	createRHFInputValidator,
	formSchema,
	getFieldMessageId,
	getFieldStatus,
} from "../../utils/form";
import type { Step2Values, StepFormReturn } from "../../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields, isSubmitted },
		stateOptions,
		cityOptions,
		handleStateChange,
		onSubmit,
	} = useStep2Form();

	// --- COMPUTED STATES ---
	const stateStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
		hasError: Boolean(errors.state),
		isTouched: Boolean(dirtyFields.state) || Boolean(touchedFields.state),
		hasValue: Boolean(formValues.state),
	});
	const cityStatus = getFieldStatus({
		isFormSubmitted: isSubmitted,
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
						rules={ValidationRules.state}
						render={({ field }) => {
							function handleStateValueChange(value: string | null): void {
								field.onChange(value);
								handleStateChange();
							}

							return (
								<Select
									id="state"
									aria-describedby={getFieldMessageId("state")}
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
					<Form.FieldMessage
						inputId="state"
						status={stateStatus}
					>
						{errors.state?.message}
					</Form.FieldMessage>
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
						rules={ValidationRules.city}
						render={({ field }) => (
							<Select
								id="city"
								aria-describedby={getFieldMessageId("city")}
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
					<Form.FieldMessage
						inputId="city"
						status={cityStatus}
					>
						{errors.city?.message}
					</Form.FieldMessage>
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
	handleStateChange: () => void;
};

function useStep2Form(): UseStep2FormReturn {
	// --- HOOKS ---
	const { stateOptions, getCitiesOptions } = useColombiaLocations();
	const { scope, updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: (keyof Step2Values)[] = useMemo(() => ["state", "city"], []);
	const DEFAULT_VALUES = useMemo(
		() => getDefaultValues(FORM_INPUTS_NAME),
		[getDefaultValues, FORM_INPUTS_NAME],
	);
	const form = useForm<Step2Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- HANDLERS ---
	const submitForm = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
		clearPersistedInputs(scope, FORM_INPUTS_NAME);
		goToNextStep();
	});

	function onSubmit(event?: React.BaseSyntheticEvent): void {
		void submitForm(event);
	}

	function handleStateChange(): void {
		form.setValue("city", "", { shouldValidate: true, shouldDirty: true });
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();
	const cityOptions = formValues.state ? getCitiesOptions(formValues.state) : [];

	// --- EFFECTS ---
	usePersistInput("state", formValues.state);
	usePersistInput("city", formValues.city);

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

const ValidationRules: {
	state: RegisterOptions<Step2Values, "state">;
	city: RegisterOptions<Step2Values, "city">;
} = {
	state: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.state),
		},
	},
	city: {
		validate: {
			schema: createRHFInputValidator(formSchema.shape.city),
		},
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
