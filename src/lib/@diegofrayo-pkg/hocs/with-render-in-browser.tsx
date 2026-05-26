import { useSyncExternalStore } from "react";

import type ReactTypes from "../types/react";

function withRenderInBrowser<ComponentProps extends object>(
	Component: ReactTypes.FunctionComponent<ComponentProps>,
): ReactTypes.FunctionComponent<ComponentProps> {
	function RenderInBrowserComponent(props: ComponentProps): ReactTypes.JSXElementNullable {
		const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

		if (!isMounted) return null;

		return <Component {...props} />;
	}

	RenderInBrowserComponent.displayName = `withRenderInBrowser(${
		Component.displayName || Component.name || "Component"
	})`;

	return RenderInBrowserComponent;
}

export default withRenderInBrowser;

// --- UTILS ---

const subscribe = (): (() => void) => {
	console.log("withRenderInBrowser ☑️");
	return (): void => {};
};

const getSnapshot = (): boolean => true;

const getServerSnapshot = (): boolean => false;
