import type { JSX } from "react";
import type { Metadata } from "next";

import { Form, FormProvider } from "~/projects/form";

export default function Page(): JSX.Element {
	return (
		<FormProvider>
			<Form />
		</FormProvider>
	);
}

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};
