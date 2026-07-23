"use client";

import { forwardRef } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";

import cn from "~/lib/cn";

import type { FieldStatus } from "../../utils/types";

type CheckboxProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	id?: string;
} & { "data-state"?: FieldStatus };

const Checkbox = forwardRef<HTMLElement, CheckboxProps>(function Checkbox(
	{ id, checked, "data-state": dataState, onCheckedChange },
	ref,
) {
	// --- STYLES ---
	const classes = {
		root: cn(
			"flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-none border-2 border-black bg-white transition-all outline-none",

			// Hard offset shadow (no blur) — the signature neobrutalism drop.
			"shadow-[4px_4px_0_0_#000]",
			"data-checked:bg-zinc-600",

			// On focus, nudge the checkbox into its shadow so it looks "pressed".
			"focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:shadow-[2px_2px_0_0_#000]",

			// Invalid state keeps the brutalist shadow but swaps to a red border.
			"aria-invalid:border-red-600 aria-invalid:shadow-[4px_4px_0_0_var(--color-red-600)]",

			// Disabled state
			"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
		),
		indicator: cn("text-white"),
	};

	return (
		<BaseCheckbox.Root
			ref={ref}
			id={id}
			checked={checked}
			data-state={dataState}
			aria-invalid={dataState === "invalid"}
			className={classes.root}
			onCheckedChange={onCheckedChange}
		>
			<BaseCheckbox.Indicator className={classes.indicator}>
				<Check className="size-4" />
			</BaseCheckbox.Indicator>
		</BaseCheckbox.Root>
	);
});

export default Checkbox;
