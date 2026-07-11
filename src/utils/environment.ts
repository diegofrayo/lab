export function isProdEnvironment(): boolean {
	return process.env.NODE_ENV === "production";
}
