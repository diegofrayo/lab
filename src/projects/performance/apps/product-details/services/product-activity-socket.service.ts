import { createConnectionId, OrchestratorSocket } from "../../../services/orchestrator-socket.service";
import { createOrdersDataSource } from "../../../utils/orders-faker";

export type ProductActivitySocket = OrchestratorSocket<"PRODUCT_DETAILS:ORDERS">;

// The data source is created with the socket, so reconnecting keeps the prices of the product.
// The order history and the new orders arrive through the same event
export function createProductActivitySocket(productId: string): ProductActivitySocket {
	return new OrchestratorSocket({
		connectionId: createConnectionId(`product-activity-socket-${productId}`),
		dataSource: createOrdersDataSource(),
		eventNames: { initialData: "PRODUCT_DETAILS:ORDERS", updates: "PRODUCT_DETAILS:ORDERS" },
	});
}
