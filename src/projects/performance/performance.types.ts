export type RawProduct = {
	id: string;
	name: string;
	photo: string;
	price: number;
	average_price: number;
	average_sales: number;
	total_sales: number;
};

export type RawProductOrder = {
	id: string;
	quantity: number;
	price: number;
	total: number;
	buyer: string;
	// ISO string, like a JSON payload would send it
	date: string;
};

// "RECONNECTING" is the status of a socket that was live, was stopped (e.g. its window was
// minimized) and is waiting for its data again
export type SocketStatus = "CONNECTING" | "LIVE" | "RECONNECTING";
