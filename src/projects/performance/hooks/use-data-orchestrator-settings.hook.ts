"use client";

import { useSyncExternalStore } from "react";

import { dataOrchestrator, type DataOrchestratorSettings } from "../services/data-orchestrator.service";

type UseDataOrchestratorSettingsReturn = {
	settings: DataOrchestratorSettings;
	updateSettings: (settings: Partial<DataOrchestratorSettings>) => void;
};

export function useDataOrchestratorSettings(): UseDataOrchestratorSettingsReturn {
	const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	return { settings, updateSettings };
}

// Every setting is a primitive, so the component only re-renders when the selected setting changes
export function useDataOrchestratorSetting<TKey extends keyof DataOrchestratorSettings>(
	key: TKey,
): DataOrchestratorSettings[TKey] {
	function getSettingSnapshot(): DataOrchestratorSettings[TKey] {
		return dataOrchestrator.getSettings()[key];
	}

	return useSyncExternalStore(subscribe, getSettingSnapshot, getSettingSnapshot);
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
