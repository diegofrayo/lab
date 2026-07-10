"use client";

import { forwardRef } from "react";

import cn from "~/lib/cn";

type ButtonProps = React.ComponentPropsWithoutRef<"button">;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, type = "button", ...props },
	ref,
) {
	// --- STYLES ---
	const classes = {
		button: cn(
			"rounded-none border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black uppercase transition-all outline-none",
			"shadow-[4px_4px_0_0_#000]",

			// Nudge the button into its shadow on hover/focus so it looks "pressed".
			"hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000]",

			"focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:shadow-[2px_2px_0_0_#000]",
			"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
			className,
		),
	};

	return (
		<button
			ref={ref}
			type={type}
			className={classes.button}
			{...props}
		/>
	);
});

export default Button;
