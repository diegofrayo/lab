"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { JSX } from "react";

import cn from "~/lib/cn";

import { useDataOrchestratorSettings } from "../../hooks/use-data-orchestrator-settings.hook";
import { MIN_UPDATE_INTERVAL_MS, type ProductsListMode } from "../../services/data-orchestrator.service";

// The orchestrator doesn't belong to this window, so minimizing it doesn't pause anything
function DataOrchestratorApp(): JSX.Element {
	// --- HOOKS ---
	const { settings, updateSettings } = useDataOrchestratorSettings();

	// --- STATES & REFS ---
	const [intervalDraft, setIntervalDraft] = useState(String(settings.defaultUpdateIntervalMs));

	// --- COMPUTED STATES ---
	const parsedInterval = Number(intervalDraft);
	const isIntervalValid = Number.isInteger(parsedInterval) && parsedInterval >= MIN_UPDATE_INTERVAL_MS;
	const isIntervalUnchanged = parsedInterval === settings.defaultUpdateIntervalMs;
	const isApplyDisabled = !isIntervalValid || isIntervalUnchanged;

	// --- HANDLERS ---
	function handleDispatchingUpdatesChange(e: ChangeEvent<HTMLInputElement>): void {
		updateSettings({ isDispatchingUpdates: e.target.checked });
	}

	function handleProductsListModeChange(e: ChangeEvent<HTMLInputElement>): void {
		const option = PRODUCTS_LIST_MODE_OPTIONS.find(({ value }) => value === e.target.value);
		if (!option) return;

		updateSettings({ productsListMode: option.value });
	}

	function handleIntervalChange(e: ChangeEvent<HTMLInputElement>): void {
		setIntervalDraft(e.target.value);
	}

	function handleIntervalSubmit(e: FormEvent<HTMLFormElement>): void {
		e.preventDefault();
		if (isApplyDisabled) return;

		updateSettings({ defaultUpdateIntervalMs: parsedInterval });
	}

	return (
		<section className={dataOrchestratorAppStyles.container}>
			<h1 className={dataOrchestratorAppStyles.title}>Data Orchestrator</h1>
			<div className={dataOrchestratorAppStyles.field}>
				<label className={dataOrchestratorAppStyles.checkboxLabel}>
					<input
						type="checkbox"
						className={dataOrchestratorAppStyles.checkbox}
						checked={settings.isDispatchingUpdates}
						aria-describedby={DISPATCHING_UPDATES_HINT_ID}
						onChange={handleDispatchingUpdatesChange}
					/>
					Dispatch updates automatically
				</label>
				<p
					id={DISPATCHING_UPDATES_HINT_ID}
					className={dataOrchestratorAppStyles.hint}
				>
					While stopped, the connections only receive their initial data.
				</p>
			</div>
			<form
				className={dataOrchestratorAppStyles.field}
				onSubmit={handleIntervalSubmit}
			>
				<label
					htmlFor="data-orchestrator-update-interval"
					className={dataOrchestratorAppStyles.label}
				>
					Default update interval (ms)
				</label>
				<div className={dataOrchestratorAppStyles.intervalRow}>
					<input
						id="data-orchestrator-update-interval"
						type="number"
						className={dataOrchestratorAppStyles.input}
						min={MIN_UPDATE_INTERVAL_MS}
						step={100}
						value={intervalDraft}
						aria-describedby={UPDATE_INTERVAL_HINT_ID}
						aria-invalid={!isIntervalValid}
						onChange={handleIntervalChange}
					/>
					<button
						type="submit"
						className={dataOrchestratorAppStyles.button}
						disabled={isApplyDisabled}
					>
						Apply
					</button>
				</div>
				<IntervalHint
					id={UPDATE_INTERVAL_HINT_ID}
					isIntervalValid={isIntervalValid}
				/>
			</form>
			<fieldset
				className={dataOrchestratorAppStyles.field}
				aria-describedby={PRODUCTS_LIST_MODE_HINT_ID}
			>
				<legend className={dataOrchestratorAppStyles.legend}>Products list mode</legend>
				{PRODUCTS_LIST_MODE_OPTIONS.map((option) => (
					<label
						key={option.value}
						className={dataOrchestratorAppStyles.checkboxLabel}
					>
						<input
							type="radio"
							name="data-orchestrator-products-list-mode"
							className={dataOrchestratorAppStyles.checkbox}
							value={option.value}
							checked={settings.productsListMode === option.value}
							onChange={handleProductsListModeChange}
						/>
						{option.label}
					</label>
				))}
				<p
					id={PRODUCTS_LIST_MODE_HINT_ID}
					className={dataOrchestratorAppStyles.hint}
				>
					Plain renders all the rows, content-visibility lets the browser skip the off-screen ones, and
					virtualized only mounts the visible ones.
				</p>
			</fieldset>
		</section>
	);
}

// --- STYLES ---

const dataOrchestratorAppStyles = {
	container: cn("flex flex-col gap-5"),
	title: cn("text-2xl font-semibold text-gray-800"),
	field: cn("flex flex-col gap-1"),
	checkboxLabel: cn("flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800"),
	checkbox: cn("h-4 w-4 cursor-pointer accent-blue-600"),
	label: cn("text-sm font-medium text-gray-800"),
	legend: cn("mb-1 text-sm font-medium text-gray-800"),
	hint: cn("text-xs text-gray-500"),
	intervalRow: cn("flex items-center gap-2"),
	input: cn(
		"w-32 rounded border border-gray-300 px-2 py-1 text-sm tabular-nums focus:border-blue-600 focus:outline-none",
	),
	button: cn(
		"cursor-pointer rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
	),
};

export default DataOrchestratorApp;

// --- CONSTANTS ---

const DISPATCHING_UPDATES_HINT_ID = "data-orchestrator-dispatching-updates-hint";
const UPDATE_INTERVAL_HINT_ID = "data-orchestrator-update-interval-hint";
const PRODUCTS_LIST_MODE_HINT_ID = "data-orchestrator-products-list-mode-hint";

const PRODUCTS_LIST_MODE_OPTIONS: { value: ProductsListMode; label: string }[] = [
	{ value: "PLAIN", label: "Plain" },
	{ value: "CONTENT_VISIBILITY", label: "content-visibility" },
	{ value: "VIRTUAL", label: "Virtualized" },
];

// --- COMPONENTS ---

// => IntervalHint <=

type IntervalHintProps = {
	id: string;
	isIntervalValid: boolean;
};

function IntervalHint({ id, isIntervalValid }: IntervalHintProps): JSX.Element {
	// --- STYLES ---
	const styles = intervalHintStyles({ isIntervalValid });

	return (
		<p
			id={id}
			className={styles.hint}
		>
			{isIntervalValid
				? "Used by all the connections."
				: `It must be an integer of at least ${MIN_UPDATE_INTERVAL_MS} ms.`}
		</p>
	);
}

const intervalHintStyles = ({ isIntervalValid }: { isIntervalValid: boolean }) =>
	({
		hint: cn("text-xs", isIntervalValid ? "text-gray-500" : "text-red-600"),
	}) as const;
