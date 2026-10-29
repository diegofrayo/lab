/**
 * Fake server that simulates socket connections. Each connection receives its initial data once
 * (after a simulated latency) and then periodic updates, all delivered as `CustomEvent`s.
 */

export type DataOrchestratorEventName = "FETCH_INITIAL_DATA" | "GET_UPDATES";

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

type ConnectParams<TData> = {
	connectionId: string;
	dataSource: DataSource<TData>;
	latencyMs?: number;
	updateIntervalMs?: number;
};

const DEFAULT_LATENCY_MS = 300;
const DEFAULT_UPDATE_INTERVAL_MS = 1000;

class DataOrchestrator {
	private eventTarget = new EventTarget();
	private connections = new Map<string, Connection>();

	connect<TData>({
		connectionId,
		dataSource,
		latencyMs = DEFAULT_LATENCY_MS,
		updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
	}: ConnectParams<TData>): void {
		this.disconnect(connectionId);

		const connection: Connection = {
			updatesIntervalId: null,
			latencyTimeoutId: setTimeout(() => {
				let data = dataSource.getInitialData();
				this.dispatch("FETCH_INITIAL_DATA", { connectionId, data });

				connection.updatesIntervalId = setInterval(() => {
					data = dataSource.getUpdates(data);
					this.dispatch("GET_UPDATES", { connectionId, data });
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

	subscribe<TData>(
		eventName: DataOrchestratorEventName,
		listener: (detail: DataOrchestratorEventDetail<TData>) => void,
	): () => void {
		function handleEvent(event: Event): void {
			if (!(event instanceof CustomEvent)) return;
			listener(event.detail as DataOrchestratorEventDetail<TData>);
		}

		this.eventTarget.addEventListener(eventName, handleEvent);

		return (): void => {
			this.eventTarget.removeEventListener(eventName, handleEvent);
		};
	}

	private dispatch<TData>(
		eventName: DataOrchestratorEventName,
		detail: DataOrchestratorEventDetail<TData>,
	): void {
		this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
	}
}

export const dataOrchestrator = new DataOrchestrator();
