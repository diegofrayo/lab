"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { JSX } from "react";

import cn from "~/lib/cn";

import { useDataOrchestratorSettings } from "../../hooks/use-data-orchestrator-settings.hook";
import { MIN_UPDATE_INTERVAL_MS } from "../../services/data-orchestrator.service";

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

	// --- STYLES ---
	const classes = {
		container: cn("flex flex-col gap-5"),
		title: cn("text-2xl font-semibold text-gray-800"),
		field: cn("flex flex-col gap-1"),
		checkboxLabel: cn("flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800"),
		checkbox: cn("h-4 w-4 cursor-pointer accent-blue-600"),
		label: cn("text-sm font-medium text-gray-800"),
		hint: cn("text-xs text-gray-500"),
		intervalRow: cn("flex items-center gap-2"),
		input: cn(
			"w-32 rounded border border-gray-300 px-2 py-1 text-sm tabular-nums focus:border-blue-600 focus:outline-none",
		),
		button: cn(
			"cursor-pointer rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
		),
	};

	// --- HANDLERS ---
	function handleDispatchingUpdatesChange(e: ChangeEvent<HTMLInputElement>): void {
		updateSettings({ isDispatchingUpdates: e.target.checked });
	}

	function handleVirtualizingProductsChange(e: ChangeEvent<HTMLInputElement>): void {
		updateSettings({ isVirtualizingProducts: e.target.checked });
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
		<section className={classes.container}>
			<h1 className={classes.title}>Data Orchestrator</h1>
			<div className={classes.field}>
				<label className={classes.checkboxLabel}>
					<input
						type="checkbox"
						className={classes.checkbox}
						checked={settings.isDispatchingUpdates}
						aria-describedby={DISPATCHING_UPDATES_HINT_ID}
						onChange={handleDispatchingUpdatesChange}
					/>
					Dispatch updates automatically
				</label>
				<p
					id={DISPATCHING_UPDATES_HINT_ID}
					className={classes.hint}
				>
					While stopped, the connections only receive their initial data.
				</p>
			</div>
			<form
				className={classes.field}
				onSubmit={handleIntervalSubmit}
			>
				<label
					htmlFor="data-orchestrator-update-interval"
					className={classes.label}
				>
					Default update interval (ms)
				</label>
				<div className={classes.intervalRow}>
					<input
						id="data-orchestrator-update-interval"
						type="number"
						className={classes.input}
						min={MIN_UPDATE_INTERVAL_MS}
						step={100}
						value={intervalDraft}
						aria-describedby={UPDATE_INTERVAL_HINT_ID}
						aria-invalid={!isIntervalValid}
						onChange={handleIntervalChange}
					/>
					<button
						type="submit"
						className={classes.button}
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
			<div className={classes.field}>
				<label className={classes.checkboxLabel}>
					<input
						type="checkbox"
						className={classes.checkbox}
						checked={settings.isVirtualizingProducts}
						aria-describedby={VIRTUALIZING_PRODUCTS_HINT_ID}
						onChange={handleVirtualizingProductsChange}
					/>
					Virtualize the products list
				</label>
				<p
					id={VIRTUALIZING_PRODUCTS_HINT_ID}
					className={classes.hint}
				>
					While disabled, all the product rows are rendered at once.
				</p>
			</div>
		</section>
	);
}

export default DataOrchestratorApp;

// --- CONSTANTS ---

const DISPATCHING_UPDATES_HINT_ID = "data-orchestrator-dispatching-updates-hint";
const UPDATE_INTERVAL_HINT_ID = "data-orchestrator-update-interval-hint";
const VIRTUALIZING_PRODUCTS_HINT_ID = "data-orchestrator-virtualizing-products-hint";

// --- COMPONENTS ---

type IntervalHintProps = {
	id: string;
	isIntervalValid: boolean;
};

function IntervalHint({ id, isIntervalValid }: IntervalHintProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		hint: cn("text-xs", isIntervalValid ? "text-gray-500" : "text-red-600"),
	};

	return (
		<p
			id={id}
			className={classes.hint}
		>
			{isIntervalValid
				? "Used by all the connections."
				: `It must be an integer of at least ${MIN_UPDATE_INTERVAL_MS} ms.`}
		</p>
	);
}
