import {
	dataOrchestrator,
	type DataOrchestratorEventDetail,
	type DataOrchestratorEvents,
} from "../../../services/data-orchestrator.service";
import { createOrdersDataSource } from "../../../utils/orders-faker";

type ProductActivitySocketEvents = Pick<DataOrchestratorEvents, "PRODUCT_DETAILS:ORDERS">;

type ProductActivitySocketEventName = keyof ProductActivitySocketEvents;

// The payload is typed by the API contract but, like a real socket, it is not trusted: consumers
// must validate it
type ProductActivitySocketHandler<TEventName extends ProductActivitySocketEventName> = (
	data: ProductActivitySocketEvents[TEventName],
) => void;

let connectionsCount = 0;

export class ProductActivitySocket {
	private connectionId: string;
	// Created once, so reconnecting keeps the prices of the product
	private dataSource = createOrdersDataSource();
	private isConnected = false;
	private handlers: {
		[TEventName in ProductActivitySocketEventName]: Set<ProductActivitySocketHandler<TEventName>>;
	} = {
		"PRODUCT_DETAILS:ORDERS": new Set(),
	};
	private unsubscribers: Array<() => void> = [];

	constructor(productId: string) {
		this.connectionId = `product-activity-socket-${productId}-${++connectionsCount}`;
	}

	connect(): void {
		if (this.isConnected) return;

		this.isConnected = true;
		this.unsubscribers = [
			dataOrchestrator.subscribe("PRODUCT_DETAILS:ORDERS", (detail) => {
				this.notify("PRODUCT_DETAILS:ORDERS", detail);
			}),
		];

		// The order history and the new orders arrive through the same event
		dataOrchestrator.connect({
			connectionId: this.connectionId,
			dataSource: this.dataSource,
			eventNames: { initialData: "PRODUCT_DETAILS:ORDERS", updates: "PRODUCT_DETAILS:ORDERS" },
		});
	}

	disconnect(): void {
		if (!this.isConnected) return;

		this.isConnected = false;
		this.unsubscribers.forEach((unsubscribe) => unsubscribe());
		this.unsubscribers = [];

		dataOrchestrator.disconnect(this.connectionId);
	}

	on<TEventName extends ProductActivitySocketEventName>(
		eventName: TEventName,
		handler: ProductActivitySocketHandler<TEventName>,
	): () => void {
		this.handlers[eventName].add(handler);

		return (): void => {
			this.handlers[eventName].delete(handler);
		};
	}

	private notify<TEventName extends ProductActivitySocketEventName>(
		eventName: TEventName,
		{ connectionId, data }: DataOrchestratorEventDetail<ProductActivitySocketEvents[TEventName]>,
	): void {
		if (connectionId !== this.connectionId) return;
		this.handlers[eventName].forEach((handler) => handler(data));
	}
}
