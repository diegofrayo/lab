export type { RawProductOrder } from "./apps/product-details/utils/orders-parser";
export type { RawProduct } from "./apps/products/utils/products-parser";

// "RECONNECTING" is the status of a socket that was live, was stopped (e.g. its window was
// minimized) and is waiting for its data again
export type SocketStatus = "CONNECTING" | "LIVE" | "RECONNECTING";
