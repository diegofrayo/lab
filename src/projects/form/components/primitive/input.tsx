"use client";

import { forwardRef } from "react";
import { Input as BaseInput } from "@base-ui/react/input";

import cn from "~/lib/cn";

import type { FieldStatus } from "../../utils/types";

type InputProps = BaseInput.Props & { "data-state": FieldStatus };

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, ...props },
	ref,
) {
	// --- STYLES ---
	const classes = {
		input: cn(
			"flex h-10 w-full min-w-0 rounded-none border-2 border-black bg-white px-3 py-1 text-base font-medium text-black transition-all outline-none",

			// Hard offset shadow (no blur) — the signature neobrutalism drop.
			"shadow-[4px_4px_0_0_#000]",
			"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-black",
			"selection:bg-black selection:text-white placeholder:text-neutral-500",

			// On focus, nudge the input into its shadow so it looks "pressed".
			"focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:shadow-[2px_2px_0_0_#000]",

			// Invalid state keeps the brutalist shadow but swaps to a red border.
			"aria-invalid:border-red-600 aria-invalid:shadow-[4px_4px_0_0_var(--color-red-600)]",

			// Validity styling driven by `data-state` so the border/shadow color
			// tracks the field's state without the consumer passing extra classes.
			"data-[state=valid]:border-green-600 data-[state=valid]:shadow-[4px_4px_0_0_var(--color-green-600)] data-[state=valid]:focus-visible:shadow-[2px_2px_0_0_var(--color-green-600)]",
			"data-[state=invalid]:border-red-600 data-[state=invalid]:shadow-[4px_4px_0_0_var(--color-red-600)] data-[state=invalid]:focus-visible:shadow-[2px_2px_0_0_var(--color-red-600)]",

			// Disabled state
			"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",

			// Responsiveness styling
			"md:text-sm",

			className,
		),
	};

	return (
		<BaseInput
			ref={ref}
			className={classes.input}
			{...props}
		/>
	);
});

export default Input;
