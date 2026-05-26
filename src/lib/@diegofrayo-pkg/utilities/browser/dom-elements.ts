import { isNull } from "../../validator";

export function focusElement(element: HTMLElement): void {
	element.focus();
	element.click();
}

export function focusInputAndSelectText(element: HTMLInputElement): void {
	element.focus();
	element.select();
}

export function isElementInViewport(element: Element): boolean {
	const bounding = element.getBoundingClientRect();

	return (
		bounding.top >= 0 &&
		bounding.left >= 0 &&
		bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

export function getTargetElement<HTMLElement>(event: Event): HTMLElement {
	if (isNull(event.target)) {
		throw new Error("Target element is null unexpectedly");
	}

	return event.target as HTMLElement;
}
