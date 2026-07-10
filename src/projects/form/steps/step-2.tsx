import type { JSX } from "react";

import FormNavigationButtons from "../components/form-navigation-buttons";

function Step2(): JSX.Element {
	return (
		<div>
			<p>Step 2</p>

			<FormNavigationButtons isCurrentFormValid={false} />
		</div>
	);
}

export default Step2;
