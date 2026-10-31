"use client";

import { useSyncExternalStore } from "react";

import {
	dataOrchestrator,
	type DataOrchestratorSettings,
} from "../../../services/data-orchestrator.service";

type UseDataOrchestratorSettingsReturn = {
	settings: DataOrchestratorSettings;
	updateSettings: (settings: Partial<DataOrchestratorSettings>) => void;
};

export function useDataOrchestratorSettings(): UseDataOrchestratorSettingsReturn {
	const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	return { settings, updateSettings };
}

// --- UTILS ---

function subscribe(listener: () => void): () => void {
	return dataOrchestrator.subscribeToSettings(listener);
}

function getSnapshot(): DataOrchestratorSettings {
	return dataOrchestrator.getSettings();
}

function updateSettings(settings: Partial<DataOrchestratorSettings>): void {
	dataOrchestrator.updateSettings(settings);
}
