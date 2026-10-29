import {
	dataOrchestrator,
	type DataOrchestratorEventDetail,
	type DataOrchestratorEventName,
} from "../../../services/data-orchestrator.service";
import { createProducts, updateProducts } from "../../../utils/products-faker";

// Like a real socket, the payload is not trusted: consumers must validate it
type ProductsSocketHandler = (data: unknown) => void;

let connectionsCount = 0;

export class ProductsSocket {
	private connectionId = `products-socket-${++connectionsCount}`;
	private isConnected = false;
	private handlers: Record<DataOrchestratorEventName, Set<ProductsSocketHandler>> = {
		FETCH_INITIAL_DATA: new Set(),
		GET_UPDATES: new Set(),
	};
	private unsubscribers: Array<() => void> = [];

	connect(): void {
		if (this.isConnected) return;

		this.isConnected = true;
		this.unsubscribers = [
			dataOrchestrator.subscribe<unknown>("FETCH_INITIAL_DATA", (detail) => {
				this.notify("FETCH_INITIAL_DATA", detail);
			}),
			dataOrchestrator.subscribe<unknown>("GET_UPDATES", (detail) => {
				this.notify("GET_UPDATES", detail);
			}),
		];

		dataOrchestrator.connect({
			connectionId: this.connectionId,
			dataSource: {
				getInitialData: createProducts,
				getUpdates: updateProducts,
			},
		});
	}

	disconnect(): void {
		if (!this.isConnected) return;

		this.isConnected = false;
		this.unsubscribers.forEach((unsubscribe) => unsubscribe());
		this.unsubscribers = [];

		dataOrchestrator.disconnect(this.connectionId);
	}

	on(eventName: DataOrchestratorEventName, handler: ProductsSocketHandler): () => void {
		this.handlers[eventName].add(handler);

		return (): void => {
			this.handlers[eventName].delete(handler);
		};
	}

	private notify(
		eventName: DataOrchestratorEventName,
		{ connectionId, data }: DataOrchestratorEventDetail<unknown>,
	): void {
		if (connectionId !== this.connectionId) return;
		this.handlers[eventName].forEach((handler) => handler(data));
	}
}
