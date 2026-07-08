import type { JSX } from "react";

import { Desktop, DesktopProvider } from "~/projects/performance/desktop";

export default function Page(): JSX.Element {
	return (
		<DesktopProvider>
			<Desktop />
		</DesktopProvider>
	);
}
