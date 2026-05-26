/* eslint @typescript-eslint/no-namespace: 0 */

import * as ReactLibrary from "react";

declare namespace ReactTypes {
	// --- REACT ---
	// RETURNS
	export type JSXElement = ReactLibrary.JSX.Element;
	export type JSXElementNullable = ReactLibrary.JSX.Element | null;

	// CHILDREN PROP
	export type Children = ReactLibrary.ReactNode;

	// STYLE PROP
	export type Styles = ReactLibrary.CSSProperties;

	// CHILDREN NODES
	export type Node = ReactLibrary.ReactNode;

	// COMPONENTS AS PROPS
	export type FunctionComponent<ComponentProps = Record<string, unknown>> =
		ReactLibrary.FunctionComponent<ComponentProps>;

	export type CompoundedComponent<
		ComponentProps,
		HTMLElement,
		StaticProperties extends object,
	> = ReactLibrary.ForwardRefExoticComponent<
		ComponentProps & ReactLibrary.RefAttributes<HTMLElement>
	> &
		StaticProperties;

	// REFS
	export type Ref<RefType> = ReactLibrary.RefObject<RefType>;

	// EFFECTS CALLBACK
	export type EffectCallback = ReactLibrary.EffectCallback;

	// SET STATE
	export type SetState<State> = ReactLibrary.Dispatch<ReactLibrary.SetStateAction<State>>;

	// EVENT HANDLERS
	export namespace Events {
		export type OnClickEvent<HTMLElement> = ReactLibrary.MouseEvent<HTMLElement>;

		export type OnClickEventHandler<HTMLElement = HTMLButtonElement> =
			ReactLibrary.MouseEventHandler<HTMLElement>;

		export type OnChangeEvent<HTMLElement = HTMLInputElement> =
			ReactLibrary.ChangeEvent<HTMLElement>;

		export type OnChangeEventHandler<HTMLElement> = ReactLibrary.ChangeEventHandler<HTMLElement>;

		export type OnFocusEvent<HTMLElement = HTMLInputElement> = ReactLibrary.FocusEvent<HTMLElement>;

		export type OnFocusEventHandler<HTMLElement = HTMLInputElement> =
			ReactLibrary.FocusEventHandler<HTMLElement>;

		export type OnKeyUpEvent<HTMLElement> = ReactLibrary.KeyboardEvent<HTMLElement>;

		export type OnKeyUpEventHandler<HTMLElement> = ReactLibrary.KeyboardEventHandler<HTMLElement>;

		export type OnSubmitEvent<HTMLElement> = ReactLibrary.FormEvent<HTMLElement>;

		export type OnSubmitEventHandler<HTMLElement> = ReactLibrary.FormEventHandler<HTMLElement>;

		export type OnMouseEvent<HTMLElement> = ReactLibrary.PointerEvent<HTMLElement>;

		export type OnMouseEventHandler<HTMLElement> = ReactLibrary.PointerEventHandler<HTMLElement>;

		export type OnTouchEvent<HTMLElement> = ReactLibrary.TouchEvent<HTMLElement>;

		export type OnTouchEventHandler<HTMLElement> = ReactLibrary.TouchEventHandler<HTMLElement>;
	}

	// --- DOM ---
	export namespace DOM {
		export import HTMLElementAttributes = ReactLibrary.JSX.IntrinsicElements;
	}
}

export type { ReactTypes as default };
