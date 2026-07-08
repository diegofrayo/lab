import type { JSX } from "react";

import cn from "~/lib/cn";

function LoginApp(): JSX.Element {
	// --- STYLES ---
	const classes = {
		title: cn("text-2xl font-semibold text-gray-800"),
	};

	return <h1 className={classes.title}>Login</h1>;
}

export default LoginApp;
