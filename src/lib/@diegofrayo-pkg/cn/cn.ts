import classNames from "classnames";
import { twMerge } from "tailwind-merge";

function cn(...inputs: unknown[]): string {
	return twMerge(classNames(inputs));
}

export default cn;
