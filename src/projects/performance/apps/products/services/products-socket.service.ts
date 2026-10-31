import {
	dataOrchestrator,
	type DataOrchestratorEventDetail,
	type DataOrchestratorEvents,
} from "../../../services/data-orchestrator.service";
import { createProducts, updateProducts } from "../../../utils/products-faker";

type ProductsSocketEvents = Pick<
	DataOrchestratorEvents,
	"PRODUCTS:INITIAL_LIST" | "PRODUCTS:LIST_UPDATES"
>;

type ProductsSocketEventName = keyof ProductsSocketEvents;

// The payload is typed by the API contract but, like a real socket, it is not trusted: consumers
// must validate it
type ProductsSocketHandler<TEventName extends ProductsSocketEventName> = (
	data: ProductsSocketEvents[TEventName],
) => void;

let connectionsCount = 0;

export class ProductsSocket {
	private connectionId = `products-socket-${++connectionsCount}`;
	private isConnected = false;
	private handlers: {
		[TEventName in ProductsSocketEventName]: Set<ProductsSocketHandler<TEventName>>;
	} = {
		"PRODUCTS:INITIAL_LIST": new Set(),
		"PRODUCTS:LIST_UPDATES": new Set(),
	};
	private unsubscribers: Array<() => void> = [];

	connect(): void {
		if (this.isConnected) return;

		this.isConnected = true;
		this.unsubscribers = [
			dataOrchestrator.subscribe("PRODUCTS:INITIAL_LIST", (detail) => {
				this.notify("PRODUCTS:INITIAL_LIST", detail);
			}),
			dataOrchestrator.subscribe("PRODUCTS:LIST_UPDATES", (detail) => {
				this.notify("PRODUCTS:LIST_UPDATES", detail);
			}),
		];

		dataOrchestrator.connect({
			connectionId: this.connectionId,
			dataSource: {
				getInitialData: createProducts,
				getUpdates: updateProducts,
			},
			eventNames: { initialData: "PRODUCTS:INITIAL_LIST", updates: "PRODUCTS:LIST_UPDATES" },
		});
	}

	disconnect(): void {
		if (!this.isConnected) return;

		this.isConnected = false;
		this.unsubscribers.forEach((unsubscribe) => unsubscribe());
		this.unsubscribers = [];

		dataOrchestrator.disconnect(this.connectionId);
	}

	on<TEventName extends ProductsSocketEventName>(
		eventName: TEventName,
		handler: ProductsSocketHandler<TEventName>,
	): () => void {
		this.handlers[eventName].add(handler);

		return (): void => {
			this.handlers[eventName].delete(handler);
		};
	}

	private notify<TEventName extends ProductsSocketEventName>(
		eventName: TEventName,
		{ connectionId, data }: DataOrchestratorEventDetail<ProductsSocketEvents[TEventName]>,
	): void {
		if (connectionId !== this.connectionId) return;
		this.handlers[eventName].forEach((handler) => handler(data));
	}
}
