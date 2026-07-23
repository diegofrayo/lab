"use client";

import { forwardRef } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import cn from "~/lib/cn";

import type { FieldStatus } from "../../utils/types";

export type SelectOption = {
	label: string;
	value: string;
};

type SelectProps = {
	// Required props — alphabetical order
	items: SelectOption[];
	onValueChange: (value: string | null) => void;
	value: string | null;

	// Optional props — alphabetical order
	disabled?: boolean;
	id?: string;
	placeholder?: string;

	// Event handlers — at the end
	onBlur?: () => void;
} & { "data-state": FieldStatus };

const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{
		id,
		items,
		placeholder = "Select an option",
		value,
		disabled,
		"data-state": dataState,
		onValueChange,
		onBlur,
	},
	ref,
) {
	// --- STYLES ---
	const classes = {
		trigger: cn(
			"flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-none border-2 border-black bg-white px-3 py-1 text-base font-medium text-black transition-all outline-none",

			// Hard offset shadow (no blur) — the signature neobrutalism drop.
			"shadow-[4px_4px_0_0_#000]",

			// On focus/open, nudge the trigger into its shadow so it looks "pressed".
			"data-popup-open:translate-x-0.5 data-popup-open:translate-y-0.5 data-popup-open:shadow-[2px_2px_0_0_#000]",
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
		),
		popup: cn(
			"max-h-64 w-(--anchor-width) overflow-y-auto rounded-none border-2 border-black bg-white p-1",
			"shadow-[4px_4px_0_0_#000]",
		),
		item: cn(
			"flex cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-sm font-medium text-black outline-none",
			"data-highlighted:bg-black data-highlighted:text-white",
		),
	};

	return (
		<BaseSelect.Root
			items={items}
			value={value}
			disabled={disabled}
			onValueChange={onValueChange}
		>
			<BaseSelect.Trigger
				ref={ref}
				id={id}
				data-state={dataState}
				aria-invalid={dataState === "invalid"}
				className={classes.trigger}
				onBlur={onBlur}
			>
				<BaseSelect.Value placeholder={placeholder} />
				<BaseSelect.Icon>
					<ChevronDown className="size-4" />
				</BaseSelect.Icon>
			</BaseSelect.Trigger>
			<BaseSelect.Portal>
				<BaseSelect.Positioner sideOffset={8}>
					<BaseSelect.Popup className={classes.popup}>
						<BaseSelect.List>
							{items.map((item) => (
								<BaseSelect.Item
									key={item.value}
									value={item.value}
									className={classes.item}
								>
									<BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
									<BaseSelect.ItemIndicator>
										<Check className="size-4" />
									</BaseSelect.ItemIndicator>
								</BaseSelect.Item>
							))}
						</BaseSelect.List>
					</BaseSelect.Popup>
				</BaseSelect.Positioner>
			</BaseSelect.Portal>
		</BaseSelect.Root>
	);
});

export default Select;
