import type { RawProduct, RawProductOrder } from "../performance.types";

/**
 * Fake server that simulates socket connections. Each connection receives its initial data once
 * (after a simulated latency) and then periodic updates, all delivered as `CustomEvent`s.
 */

// The payload each event sends, like the contract of a real socket API
export type DataOrchestratorEvents = {
	"PRODUCTS:INITIAL_LIST": RawProduct[];
	"PRODUCTS:LIST_UPDATES": RawProduct[];
	"PRODUCT_DETAILS:ORDERS": RawProductOrder[];
};

export type DataOrchestratorEventName = keyof DataOrchestratorEvents;

export type DataOrchestratorEventDetail<TData> = {
	connectionId: string;
	data: TData;
};

export type DataSource<TData> = {
	getInitialData: () => TData;
	getUpdates: (previousData: TData) => TData;
};

export type DataOrchestratorSettings = {
	// While false, the connections only receive their initial data
	isDispatchingUpdates: boolean;
	// Used by all the connections
	defaultUpdateIntervalMs: number;
	// While false, the products list renders all its rows at once
	isVirtualizingProducts: boolean;
};

type Connection = {
	// Undefined until the initial data is sent, the updates can't start before that
	dispatchUpdate?: () => void;
	latencyTimeoutId: ReturnType<typeof setTimeout>;
	updatesIntervalId: ReturnType<typeof setInterval> | null;
};

export type DataOrchestratorConnectParams<TEventName extends DataOrchestratorEventName> = {
	connectionId: string;
	dataSource: DataSource<DataOrchestratorEvents[TEventName]>;
	eventNames: {
		initialData: TEventName;
		updates: TEventName;
	};
	latencyMs?: number;
};

const DEFAULT_LATENCY_MS = 300;
const DEFAULT_UPDATE_INTERVAL_MS = 1000;
export const MIN_UPDATE_INTERVAL_MS = 100;

class DataOrchestrator {
	private eventTarget = new EventTarget();
	private connections = new Map<string, Connection>();
	// Replaced (never mutated) on every change, so it can be used as a React external store snapshot
	private settings: DataOrchestratorSettings = {
		isDispatchingUpdates: true,
		defaultUpdateIntervalMs: DEFAULT_UPDATE_INTERVAL_MS,
		isVirtualizingProducts: true,
	};
	private settingsListeners = new Set<() => void>();

	connect<TEventName extends DataOrchestratorEventName>({
		connectionId,
		dataSource,
		eventNames,
		latencyMs = DEFAULT_LATENCY_MS,
	}: DataOrchestratorConnectParams<TEventName>): void {
		this.disconnect(connectionId);

		const connection: Connection = {
			updatesIntervalId: null,
			latencyTimeoutId: setTimeout(() => {
				let data = dataSource.getInitialData();
				this.dispatch(eventNames.initialData, { connectionId, data });

				connection.dispatchUpdate = (): void => {
					data = dataSource.getUpdates(data);
					this.dispatch(eventNames.updates, { connectionId, data });
				};
				this.startUpdates(connection);
			}, latencyMs),
		};

		this.connections.set(connectionId, connection);
	}

	disconnect(connectionId: string): void {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		clearTimeout(connection.latencyTimeoutId);
		this.stopUpdates(connection);
		this.connections.delete(connectionId);
	}

	getSettings(): DataOrchestratorSettings {
		return this.settings;
	}

	// The live connections are restarted when the updates settings change, so they apply right away
	updateSettings(settings: Partial<DataOrchestratorSettings>): void {
		const previousSettings = this.settings;
		this.settings = { ...this.settings, ...settings };

		const haveUpdatesSettingsChanged =
			previousSettings.isDispatchingUpdates !== this.settings.isDispatchingUpdates ||
			previousSettings.defaultUpdateIntervalMs !== this.settings.defaultUpdateIntervalMs;

		if (haveUpdatesSettingsChanged) {
			this.connections.forEach((connection) => {
				this.stopUpdates(connection);
				this.startUpdates(connection);
			});
		}
		this.settingsListeners.forEach((listener) => listener());
	}

	subscribeToSettings(listener: () => void): () => void {
		this.settingsListeners.add(listener);

		return (): void => {
			this.settingsListeners.delete(listener);
		};
	}

	subscribe<TEventName extends DataOrchestratorEventName>(
		eventName: TEventName,
		listener: (detail: DataOrchestratorEventDetail<DataOrchestratorEvents[TEventName]>) => void,
	): () => void {
		function handleEvent(event: Event): void {
			if (!(event instanceof CustomEvent)) return;
			listener(event.detail as DataOrchestratorEventDetail<DataOrchestratorEvents[TEventName]>);
		}

		this.eventTarget.addEventListener(eventName, handleEvent);

		return (): void => {
			this.eventTarget.removeEventListener(eventName, handleEvent);
		};
	}

	private startUpdates(connection: Connection): void {
		if (!connection.dispatchUpdate || !this.settings.isDispatchingUpdates) return;

		connection.updatesIntervalId = setInterval(
			connection.dispatchUpdate,
			this.settings.defaultUpdateIntervalMs,
		);
	}

	private stopUpdates(connection: Connection): void {
		if (connection.updatesIntervalId === null) return;

		clearInterval(connection.updatesIntervalId);
		connection.updatesIntervalId = null;
	}

	private dispatch<TEventName extends DataOrchestratorEventName>(
		eventName: TEventName,
		detail: DataOrchestratorEventDetail<DataOrchestratorEvents[TEventName]>,
	): void {
		this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
	}
}

export const dataOrchestrator = new DataOrchestrator();
