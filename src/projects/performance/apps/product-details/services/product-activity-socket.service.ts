import {
	dataOrchestrator,
	type DataOrchestratorEventDetail,
} from "../../../services/data-orchestrator.service";
import { createOrdersDataSource } from "../../../utils/orders-faker";

// Like a real socket, the payload is not trusted: consumers must validate it
type ProductActivitySocketHandler = (data: unknown) => void;

type ProductActivitySocketEventName = "PRODUCT_ORDERS";

const NEW_ORDERS_INTERVAL_MS = 5000;

let connectionsCount = 0;

export class ProductActivitySocket {
	private connectionId: string;
	private isConnected = false;
	private handlers: Record<ProductActivitySocketEventName, Set<ProductActivitySocketHandler>> = {
		PRODUCT_ORDERS: new Set(),
	};
	private unsubscribers: Array<() => void> = [];

	constructor(productId: string) {
		this.connectionId = `product-activity-socket-${productId}-${++connectionsCount}`;
	}

	connect(): void {
		if (this.isConnected) return;

		this.isConnected = true;
		this.unsubscribers = [
			dataOrchestrator.subscribe<unknown>("PRODUCT_ORDERS", (detail) => {
				this.notify("PRODUCT_ORDERS", detail);
			}),
		];

		// The order history and the new orders arrive through the same event
		dataOrchestrator.connect({
			connectionId: this.connectionId,
			dataSource: createOrdersDataSource(),
			eventNames: { initialData: "PRODUCT_ORDERS", updates: "PRODUCT_ORDERS" },
			updateIntervalMs: NEW_ORDERS_INTERVAL_MS,
		});
	}

	disconnect(): void {
		if (!this.isConnected) return;

		this.isConnected = false;
		this.unsubscribers.forEach((unsubscribe) => unsubscribe());
		this.unsubscribers = [];

		dataOrchestrator.disconnect(this.connectionId);
	}

	on(eventName: ProductActivitySocketEventName, handler: ProductActivitySocketHandler): () => void {
		this.handlers[eventName].add(handler);

		return (): void => {
			this.handlers[eventName].delete(handler);
		};
	}

	private notify(
		eventName: ProductActivitySocketEventName,
		{ connectionId, data }: DataOrchestratorEventDetail<unknown>,
	): void {
		if (connectionId !== this.connectionId) return;
		this.handlers[eventName].forEach((handler) => handler(data));
	}
}
