export type RawProduct = {
	id: string;
	name: string;
	photo: string;
	price: number;
	average_price: number;
	average_sales: number;
	total_sales: number;
};

export type RawOrder = {
	id: string;
	quantity: number;
	price: number;
	total: number;
	buyer: string;
	// ISO string, like a JSON payload would send it
	date: string;
};
