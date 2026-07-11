import type { JSX } from "react";

import { Desktop, DesktopProvider } from "./desktop";

function PerformancePage(): JSX.Element {
	return (
		<DesktopProvider>
			<Desktop />
		</DesktopProvider>
	);
}

export default PerformancePage;
