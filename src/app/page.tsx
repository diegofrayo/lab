import type ReactTypes from "@diegofrayo-pkg/types/react";

import { Desktop, DesktopProvider } from "~/projects/performance/desktop";

export default function Page(): ReactTypes.JSXElement {
	return (
		<DesktopProvider>
			<Desktop />
		</DesktopProvider>
	);
}
