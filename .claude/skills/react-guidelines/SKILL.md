---
name: react-guidelines
description: Enforces React coding conventions for diegofrayo's project. Use this skill whenever writing, editing, or reviewing any React component (.tsx/.jsx files). Triggers on requests like "create a component", "add a React component", "write a new component", "update this component", "refactor this React code", or any task involving React/TSX/JSX files. Apply these guidelines proactively — don't wait to be asked.
---

## Guidelines

A React component should follow this structure and conventions:

```tsx
import { useEffect, useRef, useState } from "react";

import cn from "@diegofrayo-pkg/cn";

import {
	Box,
	Button,
	Icon,
	IconCatalog,
	Image,
	InlineText,
	Link,
	Text,
	Title,
} from "~/components/primitive";

// Use `type`, not `interface`
type MyComponentProps = {
	// Required props — alphabetical order
	lang: Lang;
	viewMode: ViewMode;

	// Optional props — alphabetical order
	optionalProp?: string;

	// Event handlers — at the end
	onLangChange: (lang: Lang) => void;
	onViewModeChange: (viewMode: ViewMode) => void;
};

function MyComponent({ viewMode, lang, onViewModeChange, onLangChange }: MyComponentProps) {
	// --- HOOKS ---
	const [myVar] = useCustomHook();

	// --- STATES & REFS ---
	const [myState, setMyState] = useState("");
	const myRef = useRef<HTMLDivElement>(null);

	// --- COMPUTED STATES ---
	const currentData = myState + " 2 ";

	// --- STYLES ---
	const classes = {
		radioGroup: cn("flex gap-5 py-1"),
		radioItem: cn("flex cursor-pointer items-center gap-1"),
	};

	// --- HANDLERS ---
	function handleDownloadClick() {
		// ...
	}

	// --- UTILS ---
	function downloadAll() {
		// ...
	}

	// --- EFFECTS ---
	useEffect(function namedEffect() {
		// ...
	}, []);

	return <Box className="flex justify-center">my content</Box>;
}
```

- Include section comments like `// --- EFFECTS ---` and follow their order strictly
- Omit sections that have no content — never leave an empty section
- Use `cn` from `@diegofrayo-pkg/cn` for class name composition
- Use primitive components from `~/components/primitive` instead of raw HTML elements. If a needed primitive is missing, flag it but use the raw element as fallback.
- Use `type` instead of `interface` for props definitions
- Handlers must start with `handle` and end with the event type: `handleDownloadClick`, `handleNameChange`
- Always name the `useEffect` callback function: `useEffect(function myEffectName() { ... }, [])`
- Detect repeated class strings across the component and extract them into the `classes` object under `// --- STYLES ---`
- Never use `cn(...)` directly inside a `className` prop — always define the value in `classes` and reference it: `className={classes.foo}`
- Never pass inline functions as props (e.g. `onClick={() => doSomething()}`); always define them as named functions in `// --- HANDLERS ---` or `// --- UTILS ---` and reference them by name
- If the JSX contains a ternary that renders two different elements (e.g. `flag ? <A /> : <B />`), extract it into its own component. Short-circuit expressions (`flag && <A />`) do not need extraction
- Utility functions rule — if a helper function doesn't close over component state or refs, define it as a pure function outside the component (like the buildWhatsAppUrl style utils at the bottom of the file). If it does need component-scoped data, place it inside under // --- UTILS ---.
- Never attach `onClick` to a `<div>`. Use `<button>` or `<a>` instead. If a `<div>` is unavoidable, add `role="button"`, `tabIndex={0}`, and a `onKeyDown` handler to maintain accessibility.
- In JSX short-circuit expressions, always guard with a real boolean — never rely on the truthiness of a non-boolean value. `{count && <X />}` renders `"0"` when `count` is `0`; use `{count > 0 && <X />}` or `{Boolean(count) && <X />}` instead.
- All `useRef` calls must include an explicit type argument: `useRef<HTMLDivElement>(null)`, never `useRef(null)`.
- Only annotate `useState` when the type cannot be inferred — typically objects, arrays, or unions with `null` (e.g. `useState<User | null>(null)`). Omit the annotation for primitives: `useState("")` not `useState<string>("")`.
- Use semantic HTML tags (`<section>`, `<article>`, `<header>`, `<main>`, `<nav>`, `<footer>`) instead of generic `<div>` wherever the element carries semantic meaning.
- Always use named imports from React: `import { useState } from "react"`. Never use `import * as React from "react"` or `import React from "react"`.
- Source code file names must use kebab-case (e.g. `my-component.tsx`, not `MyComponent.tsx` or `myComponent.tsx`).
- Never import icons directly from an icon library package. Always use the `Icon` primitive component with `IconCatalog` to pass the icon name as a prop. If the needed icon does not exist in `IconCatalog`, add it there before using it.
- Never use `@radix-ui/*` packages when building or rewriting components. Use `@base-ui/react` instead — import the component namespace (e.g. `import { Progress } from "@base-ui/react"`) and use its subcomponents (`Progress.Root`, `Progress.Track`, `Progress.Indicator`, etc.).
- When creating a new Next.js page, split it into two folders: a thin **framework-attached** entry under `src/app/` and a **framework-agnostic** implementation under `src/features/pages/`. The rule below uses `my-page` as an example — replace it with the real page slug.

  **Folder structure:**
  ```
  src/app/my-page/
    page.tsx                        → framework-attached entry. Renders the page UI and is the ONLY place allowed to
                                      call Next.js APIs: invoke loaders, declare server actions, export `generateMetadata`,
                                      read `params`/`searchParams`, etc. Keep it thin — delegate all logic to the feature folder.

  src/features/pages/my-page/
    my-page.page.tsx                → default-exported React component (the page UI). Framework-agnostic: must not
                                      import from `next/*` or call Next.js-only APIs. Receives data via props.
    my-page.types.ts                → types scoped to this page folder
    my-page.loader.server.ts        → data-fetching function for the page. Framework-agnostic (plain async function);
                                      called from `src/app/my-page/page.tsx`. The `.server.ts` suffix marks it as
                                      server-only.
    my-page.metadata.ts             → function that builds the page metadata object. Framework-agnostic; the result is
                                      returned from `generateMetadata` in `src/app/my-page/page.tsx`.
    index.ts                        → barrel file. Re-exports the default from `my-page.page.tsx` plus any public
                                      types/loaders the `app/` entry needs.
    components/                     → components used only within this page
      component-1.tsx
      component-2.tsx
    pages/                          → nested routes (e.g. `my-page/my-subpage`). Each child follows this same
                                      structure recursively.
      my-subpage/
        ...
  ```

  **Why the split:** `src/app/*` is coupled to Next.js; `src/features/pages/*` stays portable and testable. If you ever need Next.js APIs inside the feature folder, stop and reconsider — that logic belongs in `src/app/`.
