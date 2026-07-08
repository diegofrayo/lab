import type { JSX, ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
	return (
		<html lang="en">
			<head>
				<link
					rel="icon"
					href="https://fav.farm/🧪"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}

export const metadata: Metadata = {
	title: "pow",
	description: "pow app",
};
