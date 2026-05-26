import { removeDuplicates } from "../utilities/arrays-and-objects";
import { isBoolean, isFalse, isTrue } from "../validator";

type SortableType = string | number | boolean | Date;

export function sortPlainArray(
	order: "asc" | "desc",
): (a: SortableType, b: SortableType) => number {
	return function sortByReturn(a, b) {
		const greater = order === "desc" ? -1 : 1;
		const smaller = order === "desc" ? 1 : -1;
		const aParam = a;
		const bParam = b;

		if (aParam > bParam) {
			return greater;
		}

		if (aParam < bParam) {
			return smaller;
		}

		return 0;
	};
}

type PickSortableAttributes<Type> = {
	[Key in keyof Type as Type[Key] extends SortableType ? Key : never]: Type[Key];
};

type ExtendTypeKeys<Type> = {
	[Key in keyof PickSortableAttributes<Type>]: Type[Key];
} & {
	[Key in keyof PickSortableAttributes<Type> as Key extends string ? `-${Key}` : never]: Type[Key];
};

// asc  = 1...5  |  "title"
// desc = 5...1  |  "-title"
export function sortBy<ItemType>(
	...criteria: (keyof ExtendTypeKeys<ItemType>)[]
): (a: ItemType, b: ItemType) => number {
	return function sortByReturn(a, b) {
		return removeDuplicates(criteria).reduce(
			(result, criteriaItem) => {
				if (result.finish) {
					return result;
				}

				// NOTE: This "as" is safe and not too bad
				const attribute = (criteriaItem as string).replace("-", "") as keyof ItemType;
				const order = (criteriaItem as string).startsWith("-") ? "desc" : "asc";
				const greater = order === "desc" ? -1 : 1;
				const smaller = order === "desc" ? 1 : -1;
				const aParam = a[attribute];
				const bParam = b[attribute];

				if (isBoolean(aParam) && isBoolean(bParam)) {
					if (isTrue(aParam) && isFalse(bParam)) {
						return { result: greater, finish: true };
					}

					if (isFalse(aParam) && isTrue(bParam)) {
						return { result: smaller, finish: true };
					}

					return result;
				}

				if (aParam > bParam) {
					return { result: greater, finish: true };
				}

				if (aParam < bParam) {
					return { result: smaller, finish: true };
				}

				return result;
			},
			{ result: 0, finish: false },
		).result;
	};
}

export function alphanumericSorting(a: string, b: string): number {
	return a.localeCompare(b, "en", { numeric: true });
}
