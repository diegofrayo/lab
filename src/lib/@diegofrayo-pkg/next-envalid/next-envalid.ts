import { isArray, isBrowser, isNumber, isServer, isString } from "../validator";

type EnvVarConfigAPI = {
	validate: (input: unknown) => boolean;
	getErrorMessage: typeof getErrorMessage;
};

type Config = {
	optional?: boolean;
};

function envalid<
	Object extends object,
	Keys extends keyof Object,
	Return extends { [K in Keys]: string },
>(envVarsScheme: Object, envVars: { [K in Keys]: string | undefined }): Return {
	return Object.entries(envVarsScheme).reduce((result, item) => {
		const [envVarKey, envVarConfig] = item as [string, EnvVarConfigAPI];
		const envVarValue = envVars[envVarKey as Keys];

		if (
			(envVarKey.startsWith("NEXT_PUBLIC") && isBrowser()) ||
			(!envVarKey.startsWith("NEXT_PUBLIC") && isServer())
		) {
			if (envVarConfig.validate(envVarValue)) {
				return { ...result, [envVarKey]: envVarValue };
			}

			throw new Error(envVarConfig.getErrorMessage(envVarKey, envVarValue));
		}

		return { ...result, [envVarKey]: envVarValue };
	}, {} as Return);
}

export default envalid;

// --- VALIDATORS ---

export function str(config?: Config & { choices?: string[] }): EnvVarConfigAPI {
	return {
		validate: (input): boolean => {
			if (config?.optional === true) {
				return true;
			}

			return isString(input) && config && isArray(config.choices)
				? config.choices.includes(input)
				: isString(input);
		},
		getErrorMessage,
	};
}

export function url(config?: Config): EnvVarConfigAPI {
	return {
		validate: (input): boolean => {
			try {
				if (config?.optional === true) {
					return true;
				}

				new URL(input as string);
				return true;
			} catch (_) {
				return false;
			}
		},
		getErrorMessage,
	};
}

export function number(config?: Config): EnvVarConfigAPI {
	return {
		validate: (input): boolean => {
			if (config?.optional === true) {
				return true;
			}

			return isNumber(Number(input));
		},
		getErrorMessage,
	};
}

// --- UTILS ---

function getErrorMessage(key: string, value: unknown): string {
	return `Invalid env var => KEY: "${key}" | VALUE: "${value}"`;
}
