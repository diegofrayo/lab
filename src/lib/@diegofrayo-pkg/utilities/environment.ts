import { isBrowser } from "../validator";
import { throwError } from "./errors";

const WEBSITE_DOMAIN = isBrowser()
	? window.location.href
	: process.env["NEXT_PUBLIC_WEBSITE_URL"] ||
		throwError(
			`Invalid "NEXT_PUBLIC_WEBSITE_URL" value: "${process.env["NEXT_PUBLIC_WEBSITE_URL"]}"`,
		);

export function isDevelopmentEnvironment(): boolean {
	return (
		WEBSITE_DOMAIN.includes(".local") ||
		WEBSITE_DOMAIN.includes(".localhost") ||
		WEBSITE_DOMAIN.includes("//localhost") ||
		WEBSITE_DOMAIN.includes("//127.0.0.1") ||
		WEBSITE_DOMAIN.includes("//192.")
	);
}

export function isProductionEnvironment(): boolean {
	return isDevelopmentEnvironment() === false && process.env["NODE_ENV"] === "production";
}

export function isLocalhostEnvironment(): boolean {
	return (
		WEBSITE_DOMAIN.includes("//localhost") ||
		WEBSITE_DOMAIN.includes("//127.0.0.1") ||
		WEBSITE_DOMAIN.includes("//192.")
	);
}

export function isRemoteLocalhostEnvironment(): boolean {
	// TODO: [regex] Use a regex instead of a static string
	return WEBSITE_DOMAIN.includes("//192.");
}
