"use client";

import { forwardRef } from "react";

import cn from "~/lib/cn";

import type { FieldStatus } from "../../utils/types";

type LabelProps = React.ComponentPropsWithoutRef<"label"> & { "data-state": FieldStatus };

const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
	{ className, ...props },
	ref,
) {
	// --- STYLES ---
	const classes = {
		label: cn(
			"text-sm font-medium text-black",

			// Valid/invalid styling is driven by the `data-state` attribute so the
			// consumer only needs to toggle a single prop.
			"data-[state=valid]:text-green-600",
			"data-[state=invalid]:text-red-600",

			className,
		),
	};

	return (
		<label
			ref={ref}
			className={classes.label}
			{...props}
		/>
	);
});

export default Label;
