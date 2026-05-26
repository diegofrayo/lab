export function encodeRequestParams(body: Record<string, string | number>): URLSearchParams {
	const params = new URLSearchParams();

	Object.entries(body).forEach(([key, value]) => {
		params.append(key, String(value));
	});

	return params;
}

export function goBack(): void {
	window.history.back();
}
