import { createConnectionId, OrchestratorSocket } from "../../../services/orchestrator-socket.service";
import { createProducts, updateProducts } from "../../../utils/products-faker";

export type ProductsSocket = OrchestratorSocket<"PRODUCTS:INITIAL_LIST" | "PRODUCTS:LIST_UPDATES">;

export function createProductsSocket(): ProductsSocket {
	return new OrchestratorSocket({
		connectionId: createConnectionId("products-socket"),
		dataSource: {
			getInitialData: createProducts,
			getUpdates: updateProducts,
		},
		eventNames: { initialData: "PRODUCTS:INITIAL_LIST", updates: "PRODUCTS:LIST_UPDATES" },
	});
}
