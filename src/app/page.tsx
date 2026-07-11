import type { JSX } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import cn from "~/lib/cn";
import { isProdEnvironment } from "~/utils/environment";

export default function Page(): JSX.Element {
	// --- STYLES ---
	const classes = {
		card: cn(
			"block border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
		),
	};

	return (
		<main className="mx-auto max-w-2xl px-6 py-12">
			<header className="mb-8">
				<h1 className="text-3xl font-bold">Lab</h1>
				<p className="mt-2 text-gray-600">
					A collection of subprojects for experimenting and testing features and concepts about
					programming.
				</p>
			</header>

			<nav>
				<ul className="flex flex-col gap-4">
					{SUBPROJECTS.map((subproject) => {
						if (isProdEnvironment() && !subproject.enabled) return null;

						return (
							<li key={subproject.href}>
								<Link
									href={subproject.href}
									className={classes.card}
								>
									<article>
										<h2 className="font-mono text-lg font-semibold">{subproject.name}</h2>
										<p className="mt-1 text-sm text-gray-600">{subproject.description}</p>
									</article>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</main>
	);
}

export const metadata: Metadata = {
	title: "Lab",
	description: "A collection of subprojects for experimenting and testing programming concepts.",
};

// --- TYPES ---

type Subproject = {
	href: string;
	name: string;
	description: string;
	enabled: boolean;
};

// --- CONSTANTS ---

const SUBPROJECTS: Subproject[] = [
	{
		href: "/form",
		name: "/form",
		description:
			"A multi-step form with conditional and async validations using react-hook-form, react context and zod.",
		enabled: true,
	},
	{
		href: "/performance",
		name: "/performance",
		description:
			"App that simulates a desktop environment to learn about performance, re-rendering, profiling and optimizations.",
		enabled: false,
	},
];
