import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { SelectOption } from "../components/primitive/select";
import { COLOMBIA_STORAGE_KEY } from "../utils/form";

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
export function useColombiaLocations(): UseColombiaLocationsReturn {
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
