import type { Metadata } from "next";
import type { ReactNode } from "react";

import type ReactTypes from "@diegofrayo-pkg/types/react";

import "./globals.css";

export const metadata: Metadata = {
	title: "pow",
	description: "pow app",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactTypes.JSXElement {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
