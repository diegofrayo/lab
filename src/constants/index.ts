type Subproject = {
	href: string;
	name: string;
	description: string;
	enabled: boolean;
};

export const SUBPROJECTS: Subproject[] = [
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
		enabled: true,
	},
];
