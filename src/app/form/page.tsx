import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import cn from "~/lib/cn";

const LINKS = [
	{ href: "/form/react-hook-form", name: "React Hook Form" },
	{ href: "/form/tanstack-form", name: "TanStack Form" },
];

export default function Page(): JSX.Element {
	const classes = {
		card: cn(
			"block border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
		),
	};

	return (
		<main className="mx-auto max-w-2xl px-6 py-12">
			<header className="mb-8">
				<h1 className="text-3xl font-bold">Form</h1>
				<p className="mt-2 text-gray-600">Choose which form library implementation to view.</p>
			</header>

			<nav>
				<ul className="flex flex-col gap-4">
					{LINKS.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className={classes.card}
							>
								<h2 className="font-mono text-lg font-semibold">{link.name}</h2>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</main>
	);
}

export const metadata: Metadata = { title: "Lab - Form" };
