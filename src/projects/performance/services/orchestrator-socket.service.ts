import {
	dataOrchestrator,
	type DataOrchestratorConnectParams,
	type DataOrchestratorEventDetail,
	type DataOrchestratorEventName,
	type DataOrchestratorEvents,
} from "./data-orchestrator.service";

// The payload is typed by the API contract but, like a real socket, it is not trusted: consumers
// must validate it
type OrchestratorSocketHandler<TEventName extends DataOrchestratorEventName> = (
	data: DataOrchestratorEvents[TEventName],
) => void;

/**
 * A socket connection to the data orchestrator. It only receives the events of its own connection,
 * and it can be connected again after a disconnection (e.g. when a minimized window is restored).
 */
export class OrchestratorSocket<TEventName extends DataOrchestratorEventName> {
	private config: DataOrchestratorConnectParams<TEventName>;
	private isConnected = false;
	private handlers: { [TName in TEventName]?: Set<OrchestratorSocketHandler<TName>> } = {};
	private unsubscribers: Array<() => void> = [];

	constructor(config: DataOrchestratorConnectParams<TEventName>) {
		this.config = config;
	}

	connect(): void {
		if (this.isConnected) return;

		// The initial data and the updates can arrive through the same event
		const eventNames = new Set([this.config.eventNames.initialData, this.config.eventNames.updates]);

		this.isConnected = true;
		this.unsubscribers = [...eventNames].map((eventName) =>
			dataOrchestrator.subscribe(eventName, (detail) => {
				this.notify(eventName, detail);
			}),
		);

		dataOrchestrator.connect(this.config);
	}

	disconnect(): void {
		if (!this.isConnected) return;

		this.isConnected = false;
		this.unsubscribers.forEach((unsubscribe) => unsubscribe());
		this.unsubscribers = [];

		dataOrchestrator.disconnect(this.config.connectionId);
	}

	on<TName extends TEventName>(eventName: TName, handler: OrchestratorSocketHandler<TName>): () => void {
		const handlers = this.handlers[eventName] ?? new Set();

		handlers.add(handler);
		this.handlers[eventName] = handlers;

		return (): void => {
			handlers.delete(handler);
		};
	}

	private notify<TName extends TEventName>(
		eventName: TName,
		{ connectionId, data }: DataOrchestratorEventDetail<DataOrchestratorEvents[TName]>,
	): void {
		if (connectionId !== this.config.connectionId) return;
		this.handlers[eventName]?.forEach((handler) => handler(data));
	}
}

let connectionsCount = 0;

// Each socket needs its own id, so a reconnecting socket never receives the events of another one
export function createConnectionId(prefix: string): string {
	return `${prefix}-${++connectionsCount}`;
}
