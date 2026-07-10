"use client";

import { forwardRef } from "react";

import cn from "~/lib/cn";

type ErrorMessageProps = React.ComponentPropsWithoutRef<"span">;

const ErrorMessage = forwardRef<HTMLSpanElement, ErrorMessageProps>(function ErrorMessage(
	{ className, ...props },
	ref,
) {
	// --- STYLES ---
	const classes = {
		errorMessage: cn("text-sm text-red-600", className),
	};

	return (
		<span
			ref={ref}
			className={classes.errorMessage}
			{...props}
		/>
	);
});

export default ErrorMessage;
