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

type Connection = {
	latencyTimeoutId: ReturnType<typeof setTimeout>;
	updatesIntervalId: ReturnType<typeof setInterval> | null;
};

type ConnectParams<TEventName extends DataOrchestratorEventName> = {
	connectionId: string;
	dataSource: DataSource<DataOrchestratorEvents[TEventName]>;
	eventNames: {
		initialData: TEventName;
		updates: TEventName;
	};
	latencyMs?: number;
	updateIntervalMs?: number;
};

const DEFAULT_LATENCY_MS = 300;
const DEFAULT_UPDATE_INTERVAL_MS = 1000;

class DataOrchestrator {
	private eventTarget = new EventTarget();
	private connections = new Map<string, Connection>();

	connect<TEventName extends DataOrchestratorEventName>({
		connectionId,
		dataSource,
		eventNames,
		latencyMs = DEFAULT_LATENCY_MS,
		updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
	}: ConnectParams<TEventName>): void {
		this.disconnect(connectionId);

		const connection: Connection = {
			updatesIntervalId: null,
			latencyTimeoutId: setTimeout(() => {
				let data = dataSource.getInitialData();
				this.dispatch(eventNames.initialData, { connectionId, data });

				connection.updatesIntervalId = setInterval(() => {
					data = dataSource.getUpdates(data);
					this.dispatch(eventNames.updates, { connectionId, data });
				}, updateIntervalMs);
			}, latencyMs),
		};

		this.connections.set(connectionId, connection);
	}

	disconnect(connectionId: string): void {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		clearTimeout(connection.latencyTimeoutId);
		if (connection.updatesIntervalId !== null) clearInterval(connection.updatesIntervalId);
		this.connections.delete(connectionId);
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

	private dispatch<TEventName extends DataOrchestratorEventName>(
		eventName: TEventName,
		detail: DataOrchestratorEventDetail<DataOrchestratorEvents[TEventName]>,
	): void {
		this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
	}
}

export const dataOrchestrator = new DataOrchestrator();
