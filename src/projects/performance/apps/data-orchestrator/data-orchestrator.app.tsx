"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { JSX } from "react";

import cn from "@diegofrayo-pkg/cn";

import { MIN_UPDATE_INTERVAL_MS } from "../../services/data-orchestrator.service";
import { useDataOrchestratorSettings } from "./hooks/use-data-orchestrator-settings.hook";

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
						onChange={handleDispatchingUpdatesChange}
					/>
					Dispatch updates automatically
				</label>
				<p className={classes.hint}>While stopped, the connections only receive their initial data.</p>
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
				<IntervalHint isIntervalValid={isIntervalValid} />
			</form>
		</section>
	);
}

export default DataOrchestratorApp;

// --- COMPONENTS ---

type IntervalHintProps = {
	isIntervalValid: boolean;
};

function IntervalHint({ isIntervalValid }: IntervalHintProps): JSX.Element {
	// --- STYLES ---
	const classes = {
		hint: cn("text-xs", isIntervalValid ? "text-gray-500" : "text-red-600"),
	};

	return (
		<p className={classes.hint}>
			{isIntervalValid
				? "Used by all the connections."
				: `It must be an integer of at least ${MIN_UPDATE_INTERVAL_MS} ms.`}
		</p>
	);
}
