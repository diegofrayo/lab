import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import css from "@eslint/css";

const javascriptConfig = {
	files: ["src/**/*.{mts,ts,tsx}"],
	extends: [js.configs.recommended],
	plugins: { js },
	languageOptions: { globals: globals.browser },
};

const filenameConventions = {
	ignores: [
		"src/**/\\[*\\].{ts,tsx}",
		"src/**/\\[*\\]/**/*.{ts,tsx}",
		"src/features/pages/**/\\[*\\]/**/*.{ts,tsx}",
		"src/pages/**/_*.{ts,tsx}",
		"src/pages/404.tsx",
		"src/pages/500.tsx",
		"src/routes/**/$*.{ts,tsx}",
		"src/routes/_*.tsx",
	],
	plugins: {
		"check-file": checkFile,
	},
	rules: {
		"check-file/filename-naming-convention": [
			"error",
			{ "src/**/*": "KEBAB_CASE" },
			{
				// ignore the middle extensions of the filename to support filename like bable.config.js or smoke.spec.ts
				ignoreMiddleExtensions: true,
			},
		],
	},
};

const typescriptConfig = defineConfig({
	files: ["src/**/*.{mts,ts,tsx}"],
	extends: [tseslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
	languageOptions: {
		parserOptions: {
			projectService: true,
		},
	},
	rules: {
		// NOTE: Ifs statements rules
		"no-extra-boolean-cast": "error",
		"no-negated-condition": "error",
		"no-else-return": "error",
		"no-lonely-if": "error",

		"max-lines": ["error", { max: 300, skipBlankLines: true }],
		"max-lines-per-function": ["error", { max: 150, skipBlankLines: true, skipComments: true }],
		"max-params": ["error", 3],
		"no-console": ["warn"],

		"@next/next/no-img-element": 0,

		"@typescript-eslint/ban-ts-comment": ["warn"],
		"@typescript-eslint/consistent-type-imports": "error",
		"@typescript-eslint/explicit-function-return-type": "error",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrors: "none" }],
		"@typescript-eslint/no-unnecessary-type-assertion": ["error", { typesToIgnore: ["LoaderData"] }],
		"@typescript-eslint/only-throw-error": [
			"warn",
			{
				allow: [
					{ from: "package", name: "NotFoundError", package: "@tanstack/router-core" },
					{ from: "package", name: "Redirect", package: "@tanstack/router-core" },
				],
			},
		],
	},
});

const reactConfig = {
	files: ["src/**/*.{ts,tsx}"],
	extends: [pluginReact.configs.flat["recommended"], reactHooks.configs.flat.recommended],
	settings: { react: { version: "19" } },
	rules: {
		"react/react-in-jsx-scope": ["off"],
	},
};

const cssConfig = {
	files: ["src/**/*.css"],
	extends: ["css/recommended"],
	plugins: { css },
	language: "css/css",
};

const nextConfig = defineConfig({
	files: ["src/**/*.{js,jsx,mjs,mts,ts,tsx}"],
	ignores: ["src/routes/**"],
	extends: [...nextVitals, ...nextTs],
});

const eslintConfig = defineConfig([
	nextConfig,

	javascriptConfig,
	filenameConventions,
	typescriptConfig,
	cssConfig,
	reactConfig,

	{ settings: { react: { version: "19" } } },
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules", ".intlayer"]),
]);

export default eslintConfig;
