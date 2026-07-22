"use client";

import { forwardRef } from "react";

import cn from "~/lib/cn";

type InputErrorMessageProps = React.ComponentPropsWithoutRef<"span">;

const InputErrorMessage = forwardRef<HTMLSpanElement, InputErrorMessageProps>(
	function InputErrorMessage({ className, ...props }, ref) {
		// --- STYLES ---
		const classes = {
			InputErrorMessage: cn("text-sm text-red-600", className),
		};

		if (!props.children) return null;

		return (
			<span
				ref={ref}
				className={classes.InputErrorMessage}
				{...props}
			/>
		);
	},
);

export default InputErrorMessage;
