import { forwardRef, type ForwardedRef } from "react";

import cn from "../cn";
import type UtilsTypes from "../types";
import type ReactTypes from "../types/react";
import { isArray, isPlainObject, isString } from "../validator";
import { HTML_TAGS, type HTMLTag } from "./constants";

const twcss: TWCSS = Object.assign(
	TWCSSCreator,
	HTML_TAGS.reduce(
		(result, tagName) => {
			return {
				...result,
				[tagName]: TWCSSCreator(tagName),
			};
		},
		{} as Record<HTMLTag, TWCSSComponentDefinition>,
	),
);

export default twcss;

// --- COMPONENTS ---

function TWCSSCreator(Tag: ElementToRender): TWCSSComponentDefinition {
	const TWCSSComponentDefinition: TWCSSComponentDefinition = function TWCSSComponentDefinition(
		styles,
		staticProps = {},
	) {
		const TWCSSReactComponent: TWCSSReactComponent = forwardRef(function TWCSSReactComponent(
			{ children, className = "", is, TWCSSVariant, ...rest }: TWCSSReactComponentProps,
			ref,
		) {
			/* WARN:
			 * This assertion is so useful and hard to remove
			 * I have no problem to use it
			 */
			const Element = (is || Tag) as ReactTypes.FunctionComponent<{
				[key: string]: unknown;
				ref: ReactForwardedRef;
			}>;
			const finalClassName = generateClassName({
				componentStyles: styles,
				classNameProp: className,
				TWCSSVariant,
				componentProps: rest as UtilsTypes.Object,
			});

			return (
				<Element
					className={finalClassName}
					ref={ref}
					{...staticProps}
					{...rest}
				>
					{children}
				</Element>
			);
		});

		return TWCSSReactComponent;
	};

	return TWCSSComponentDefinition;
}

// --- UTILS ---

type GenerateClassNameParams = {
	componentStyles: StylesParam;
	classNameProp: string;
	TWCSSVariant: string | undefined;
	componentProps: UtilsTypes.Object;
};

function generateClassName({
	componentStyles,
	classNameProp,
	TWCSSVariant,
	componentProps,
}: GenerateClassNameParams): string {
	// twcss.a`x y z` | twcss.a("x y z")
	if (isArray(componentStyles) || isString(componentStyles)) {
		return cn(componentStyles.toString(), classNameProp);
	}

	// twcss.a({ $TWCSS_BASE_STYLES: "y", a: "a", b: "b" c: (props) => `a ${props.x ? "s" : "w"}`})
	if (isPlainObject(componentStyles)) {
		const TWCSSVariantStyles = isString(TWCSSVariant) ? componentStyles[TWCSSVariant] : "";

		return cn(
			isString(componentStyles.$TWCSS_BASE_STYLES) && componentStyles.$TWCSS_BASE_STYLES,
			typeof TWCSSVariantStyles === "function"
				? TWCSSVariantStyles(componentProps)
				: TWCSSVariantStyles,
			classNameProp,
		);
	}

	// twcss.a``
	return cn(classNameProp);
}

// --- TYPES ---

interface TWCSSCreator {
	(Tag: ElementToRender): TWCSSComponentDefinition;
}

interface TWCSSComponentDefinition {
	(styles: StylesParam, staticProps?: UtilsTypes.Object): TWCSSReactComponent;
}

type TWCSSReactComponentProps = {
	children?: ReactTypes.Children;
	className?: string;
	TWCSSVariant?: string;
	is?: ElementToRender;
	[key: string]: unknown;
};

type TWCSSReactComponent = ReactTypes.FunctionComponent<TWCSSReactComponentProps>;

type StylesParam =
	| string
	| TemplateStringsArray
	| {
			$TWCSS_BASE_STYLES: StylesParamFunction;
			[key: string]: StylesParamFunction;
	  };

type StylesParamFunction = string | ((props: UtilsTypes.Object) => string);

// @ts-expect-error I don't know how to remove this any, styled-components also uses any to type this arg
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ElementToRender = HTMLTag | ReactFunctionComponent<any> | any;

type ReactForwardedRef = ForwardedRef<unknown>;

interface TWCSS extends TWCSSCreator {
	a: TWCSSComponentDefinition;
	abbr: TWCSSComponentDefinition;
	address: TWCSSComponentDefinition;
	area: TWCSSComponentDefinition;
	article: TWCSSComponentDefinition;
	aside: TWCSSComponentDefinition;
	audio: TWCSSComponentDefinition;
	base: TWCSSComponentDefinition;
	bdi: TWCSSComponentDefinition;
	bdo: TWCSSComponentDefinition;
	big: TWCSSComponentDefinition;
	blockquote: TWCSSComponentDefinition;
	body: TWCSSComponentDefinition;
	br: TWCSSComponentDefinition;
	button: TWCSSComponentDefinition;
	canvas: TWCSSComponentDefinition;
	caption: TWCSSComponentDefinition;
	cite: TWCSSComponentDefinition;
	code: TWCSSComponentDefinition;
	col: TWCSSComponentDefinition;
	colgroup: TWCSSComponentDefinition;
	data: TWCSSComponentDefinition;
	datalist: TWCSSComponentDefinition;
	dd: TWCSSComponentDefinition;
	del: TWCSSComponentDefinition;
	details: TWCSSComponentDefinition;
	dfn: TWCSSComponentDefinition;
	dialog: TWCSSComponentDefinition;
	div: TWCSSComponentDefinition;
	dl: TWCSSComponentDefinition;
	dt: TWCSSComponentDefinition;
	em: TWCSSComponentDefinition;
	embed: TWCSSComponentDefinition;
	fieldset: TWCSSComponentDefinition;
	figcaption: TWCSSComponentDefinition;
	figure: TWCSSComponentDefinition;
	footer: TWCSSComponentDefinition;
	form: TWCSSComponentDefinition;
	h1: TWCSSComponentDefinition;
	h2: TWCSSComponentDefinition;
	h3: TWCSSComponentDefinition;
	h4: TWCSSComponentDefinition;
	h5: TWCSSComponentDefinition;
	h6: TWCSSComponentDefinition;
	head: TWCSSComponentDefinition;
	header: TWCSSComponentDefinition;
	hgroup: TWCSSComponentDefinition;
	hr: TWCSSComponentDefinition;
	html: TWCSSComponentDefinition;
	i: TWCSSComponentDefinition;
	iframe: TWCSSComponentDefinition;
	img: TWCSSComponentDefinition;
	input: TWCSSComponentDefinition;
	ins: TWCSSComponentDefinition;
	kbd: TWCSSComponentDefinition;
	keygen: TWCSSComponentDefinition;
	label: TWCSSComponentDefinition;
	legend: TWCSSComponentDefinition;
	li: TWCSSComponentDefinition;
	link: TWCSSComponentDefinition;
	main: TWCSSComponentDefinition;
	map: TWCSSComponentDefinition;
	mark: TWCSSComponentDefinition;
	marquee: TWCSSComponentDefinition;
	meta: TWCSSComponentDefinition;
	meter: TWCSSComponentDefinition;
	nav: TWCSSComponentDefinition;
	noscript: TWCSSComponentDefinition;
	object: TWCSSComponentDefinition;
	ol: TWCSSComponentDefinition;
	optgroup: TWCSSComponentDefinition;
	option: TWCSSComponentDefinition;
	output: TWCSSComponentDefinition;
	p: TWCSSComponentDefinition;
	param: TWCSSComponentDefinition;
	picture: TWCSSComponentDefinition;
	pre: TWCSSComponentDefinition;
	progress: TWCSSComponentDefinition;
	q: TWCSSComponentDefinition;
	rp: TWCSSComponentDefinition;
	rt: TWCSSComponentDefinition;
	ruby: TWCSSComponentDefinition;
	s: TWCSSComponentDefinition;
	samp: TWCSSComponentDefinition;
	script: TWCSSComponentDefinition;
	section: TWCSSComponentDefinition;
	select: TWCSSComponentDefinition;
	small: TWCSSComponentDefinition;
	source: TWCSSComponentDefinition;
	span: TWCSSComponentDefinition;
	strong: TWCSSComponentDefinition;
	style: TWCSSComponentDefinition;
	sub: TWCSSComponentDefinition;
	summary: TWCSSComponentDefinition;
	sup: TWCSSComponentDefinition;
	table: TWCSSComponentDefinition;
	tbody: TWCSSComponentDefinition;
	td: TWCSSComponentDefinition;
	textarea: TWCSSComponentDefinition;
	tfoot: TWCSSComponentDefinition;
	th: TWCSSComponentDefinition;
	thead: TWCSSComponentDefinition;
	time: TWCSSComponentDefinition;
	title: TWCSSComponentDefinition;
	tr: TWCSSComponentDefinition;
	track: TWCSSComponentDefinition;
	u: TWCSSComponentDefinition;
	ul: TWCSSComponentDefinition;
	var: TWCSSComponentDefinition;
	video: TWCSSComponentDefinition;
	wbr: TWCSSComponentDefinition;
	circle: TWCSSComponentDefinition;
	clipPath: TWCSSComponentDefinition;
	defs: TWCSSComponentDefinition;
	ellipse: TWCSSComponentDefinition;
	foreignObject: TWCSSComponentDefinition;
	g: TWCSSComponentDefinition;
	image: TWCSSComponentDefinition;
	line: TWCSSComponentDefinition;
	linearGradient: TWCSSComponentDefinition;
	mask: TWCSSComponentDefinition;
	path: TWCSSComponentDefinition;
	pattern: TWCSSComponentDefinition;
	polygon: TWCSSComponentDefinition;
	polyline: TWCSSComponentDefinition;
	radialGradient: TWCSSComponentDefinition;
	rect: TWCSSComponentDefinition;
	stop: TWCSSComponentDefinition;
	svg: TWCSSComponentDefinition;
	text: TWCSSComponentDefinition;
	tspan: TWCSSComponentDefinition;
}
