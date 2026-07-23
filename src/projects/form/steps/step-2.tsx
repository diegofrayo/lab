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
import { useClearForm } from "../hooks/use-clear-form";
import { usePersistInput } from "../hooks/use-persist-input";
import { formSchema, getFieldStatus, validateField } from "../utils/form";
import type { FormInputName, Step2Values, StepFormReturn } from "../utils/types";

function Step2(): JSX.Element {
	// --- HOOKS ---
	const {
		control,
		formValues,
		formState: { errors, touchedFields, dirtyFields },
		departamentoOptions,
		ciudadOptions,
		handleDepartamentoChange,
		onSubmit,
	} = useStep2Form();

	// --- COMPUTED STATES ---
	const departamentoStatus = getFieldStatus({
		hasError: Boolean(errors.departamento),
		isTouched: Boolean(dirtyFields.departamento) || Boolean(touchedFields.departamento),
		hasValue: Boolean(formValues.departamento),
	});
	const ciudadStatus = getFieldStatus({
		hasError: Boolean(errors.ciudad),
		isTouched: Boolean(dirtyFields.ciudad) || Boolean(touchedFields.ciudad),
		hasValue: Boolean(formValues.ciudad),
	});
	const isCiudadDisabled = ciudadOptions.length === 0;

	return (
		<Form onSubmit={onSubmit}>
			<Form.Body>
				<Form.Field>
					<Label
						htmlFor="departamento"
						data-state={departamentoStatus}
					>
						Departamento
					</Label>
					<Controller
						name="departamento"
						control={control}
						rules={DEPARTAMENTO_RULES}
						render={({ field }) => {
							function handleDepartamentoValueChange(value: string | null): void {
								field.onChange(value);
								handleDepartamentoChange(value);
							}

							return (
								<Select
									id="departamento"
									data-state={departamentoStatus}
									items={departamentoOptions}
									placeholder="Select a departamento"
									value={field.value || null}
									ref={field.ref}
									onBlur={field.onBlur}
									onValueChange={handleDepartamentoValueChange}
								/>
							);
						}}
					/>
					<Form.FieldMessage status={departamentoStatus}>
						{errors.departamento?.message}
					</Form.FieldMessage>
				</Form.Field>

				<Form.Field>
					<Label
						htmlFor="ciudad"
						data-state={ciudadStatus}
					>
						Ciudad
					</Label>
					<Controller
						name="ciudad"
						control={control}
						rules={CIUDAD_RULES}
						render={({ field }) => (
							<Select
								id="ciudad"
								data-state={ciudadStatus}
								items={ciudadOptions}
								placeholder="Select a ciudad"
								disabled={isCiudadDisabled}
								value={field.value || null}
								ref={field.ref}
								onBlur={field.onBlur}
								onValueChange={field.onChange}
							/>
						)}
					/>
					<Form.FieldMessage status={ciudadStatus}>{errors.ciudad?.message}</Form.FieldMessage>
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
	departamentoOptions: SelectOption[];
	ciudadOptions: SelectOption[];
	handleDepartamentoChange: (departamentoId: string | null) => void;
};

function useStep2Form(): UseStep2FormReturn {
	// --- HOOKS ---
	const { departamentoOptions, getCiudadesOptions } = useColombiaLocations();
	const { updateFormValues, goToNextStep, getDefaultValues } = useFormNavigation();
	const FORM_INPUTS_NAME: FormInputName[] = useMemo(() => ["departamento", "ciudad"], []);
	const DEFAULT_VALUES = useMemo(() => getDefaultValues(FORM_INPUTS_NAME), [FORM_INPUTS_NAME]);
	const form = useForm<Step2Values>({
		mode: "onChange",
		defaultValues: DEFAULT_VALUES,
	});

	// --- STATES & REFS ---
	const [ciudadOptions, setCiudadOptions] = useState<SelectOption[]>([]);

	// --- HANDLERS ---
	const onSubmit = form.handleSubmit(function handleValidSubmit(data) {
		updateFormValues(data);
		goToNextStep();
	});

	function handleDepartamentoChange(departamentoId: string | null): void {
		form.setValue("ciudad", "", { shouldValidate: true, shouldDirty: true });
		setCiudadOptions(departamentoId ? getCiudadesOptions(departamentoId) : []);
	}

	// --- COMPUTED STATES ---
	const formValues = form.watch();

	// --- EFFECTS ---
	usePersistInput("departamento", formValues.departamento);
	usePersistInput("ciudad", formValues.ciudad);
	useClearForm(FORM_INPUTS_NAME);

	useEffect(
		function restoreCiudadOptions() {
			const departamentoId = form.getValues("departamento");

			if (!departamentoId) return;

			setCiudadOptions(getCiudadesOptions(departamentoId));
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[departamentoOptions],
	);

	return {
		...form,
		formValues,
		onSubmit,
		departamentoOptions,
		ciudadOptions,
		handleDepartamentoChange,
	};
}

// --- VALIDATION RULES ---

const DEPARTAMENTO_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.departamento, value),
	},
};

const CIUDAD_RULES = {
	validate: {
		schema: (value: string): string | true => validateField(formSchema.shape.ciudad, value),
	},
};

// --- HOOKS ---

const COLOMBIA_STORAGE_KEY = "data:colombia-locations";

type ColombiaDepartamento = {
	id: number;
	departamento: string;
	ciudades: string[];
};

type UseColombiaLocationsReturn = {
	departamentoOptions: SelectOption[];
	getCiudadesOptions: (departamentoId: string) => SelectOption[];
};

/**
 * Loads the Colombia departamentos/ciudades dataset once and caches it in
 * `localStorage`. The dataset itself is never kept in memory (no state or
 * module-level variable holds the full array) — every ciudades lookup reads
 * it back from storage on demand, and the cache is cleared when step 2
 * unmounts.
 */
function useColombiaLocations(): UseColombiaLocationsReturn {
	// --- STATES & REFS ---
	const [departamentoOptions, setDepartamentoOptions] = useState<SelectOption[]>([]);

	// --- UTILS ---
	function getCiudadesOptions(departamentoId: string): SelectOption[] {
		const departamentos = readColombiaDataFromStorage();
		const departamento = departamentos.find((item) => String(item.id) === departamentoId);

		return (departamento?.ciudades ?? []).map(toCiudadOption);
	}

	async function loadDepartamentosData(): Promise<void> {
		try {
			const departamentos = await fetchColombiaData();
			setDepartamentoOptions(departamentos.map(toDepartamentoOption));
		} catch (error) {
			toast.error("Something went wrong loading the items, please try again.");
		}
	}

	// --- EFFECTS ---
	useEffect(function loadDepartamentos() {
		loadDepartamentosData(); // eslint-disable-line react-hooks/set-state-in-effect
	}, []);

	useEffect(function clearColombiaStorageOnUnmount() {
		return function cleanup(): void {
			window.localStorage.removeItem(COLOMBIA_STORAGE_KEY);
		};
	}, []);

	return { departamentoOptions, getCiudadesOptions };
}

async function fetchColombiaData(): Promise<ColombiaDepartamento[]> {
	const cached = readColombiaDataFromStorage();

	if (cached.length > 0) {
		return cached;
	}

	const response = await fetch("/projects/form/json/colombia.min.json");
	const departamentos = (await response.json()) as ColombiaDepartamento[];

	window.localStorage.setItem(COLOMBIA_STORAGE_KEY, JSON.stringify(departamentos));

	return departamentos;
}

function readColombiaDataFromStorage(): ColombiaDepartamento[] {
	const raw = window.localStorage.getItem(COLOMBIA_STORAGE_KEY);

	if (!raw) return [];

	return JSON.parse(raw) as ColombiaDepartamento[];
}

function toDepartamentoOption(departamento: ColombiaDepartamento): SelectOption {
	return { label: departamento.departamento, value: String(departamento.id) };
}

function toCiudadOption(ciudad: string): SelectOption {
	return { label: ciudad, value: ciudad };
}
