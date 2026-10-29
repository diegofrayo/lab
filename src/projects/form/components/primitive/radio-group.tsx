"use client";

import type { JSX } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import cn from "~/lib/cn";

import type { FieldStatus } from "../../utils/types";
import Label from "./label";

export type RadioGroupOption<Value> = {
	label: string;
	value: Value;
};

type RadioGroupProps<Value> = {
	// Required props — alphabetical order
	"aria-labelledby": string;
	"data-state": FieldStatus;
	items: RadioGroupOption<Value>[];
	onValueChange: (value: Value) => void;
	value: Value | null;

	// Optional props — alphabetical order
	"aria-describedby"?: string;
	name?: string;

	// Event handlers — at the end
	onBlur?: () => void;
};

function RadioGroup<Value>({
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	"data-state": dataState,
	items,
	name,
	value,
	onValueChange,
	onBlur,
}: RadioGroupProps<Value>): JSX.Element {
	// --- STYLES ---
	const classes = {
		group: cn("flex flex-row items-center gap-5"),
		option: cn("flex cursor-pointer items-center gap-2"),
		radio: cn(
			"flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-white transition-all outline-none",

			// Hard offset shadow (no blur) — the signature neobrutalism drop.
			"shadow-[4px_4px_0_0_#000]",
			"data-checked:bg-zinc-600",

			// On focus, nudge the radio into its shadow so it looks "pressed".
			"focus-visible:translate-x-0.5 focus-visible:translate-y-0.5 focus-visible:shadow-[2px_2px_0_0_#000]",

			// Validity styling driven by `data-state`, like the other primitives.
			"data-[state=invalid]:border-red-600 data-[state=invalid]:shadow-[4px_4px_0_0_var(--color-red-600)]",

			// Disabled state
			"data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:shadow-none",
		),
		indicator: cn("size-2.5 rounded-full bg-white"),
	};

	// --- HANDLERS ---
	function handleValueChange(nextValue: Value | null): void {
		if (nextValue === null) return;

		onValueChange(nextValue);
	}

	return (
		<BaseRadioGroup
			name={name}
			value={value}
			aria-labelledby={ariaLabelledBy}
			aria-describedby={ariaDescribedBy}
			aria-invalid={dataState === "invalid"}
			className={classes.group}
			onValueChange={handleValueChange}
		>
			{items.map((item) => (
				<Label
					key={String(item.value)}
					className={classes.option}
					data-state={dataState}
				>
					<Radio.Root
						value={item.value}
						data-state={dataState}
						className={classes.radio}
						onBlur={onBlur}
					>
						<Radio.Indicator className={classes.indicator} />
					</Radio.Root>
					{item.label}
				</Label>
			))}
		</BaseRadioGroup>
	);
}

export default RadioGroup;
