import type { JSX } from "react";

import FormNavigationButtons from "../components/form-navigation-buttons";

function Step2(): JSX.Element {
	return (
		<div>
			<p>Step 2 - Work in progress...</p>

			<FormNavigationButtons isCurrentFormValid={false} />
		</div>
	);
}

export default Step2;
