# Lab

A collection of subprojects for experimenting and testing features and concepts about programming.

Built with [Next.js](https://nextjs.org/) (App Router), React 19, TypeScript and Tailwind CSS. Each subproject lives under `src/projects` and is exposed through a route in `src/app`.

## Subprojects

### `/form`

A multi-step form with conditional and async validations, built with react context and zod.

### `/performance`

An app that simulates a desktop environment (windows, taskbar, desktop icons and apps) to learn about performance, re-rendering, profiling and optimizations.

## Getting started

This project uses [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

The app runs on the local dev server (started via `portless`). Open the printed URL to browse the subprojects from the home page.

## Scripts

| Script          | Description                             |
| --------------- | ---------------------------------------- |
| `pnpm dev`      | Start the development server            |
| `pnpm build`    | Create a production build               |
| `pnpm start`    | Serve the production build              |
| `pnpm build:ts` | Type-check the project (`tsc --noEmit`) |
| `pnpm lint`     | Run ESLint                              |
| `pnpm format`   | Format source files with Prettier       |

## Project structure

```
src/
├── app/          # Next.js routes (one page per subproject)
├── projects/     # Subproject implementations
│   ├── form/
│   └── performance/
├── lib/          # Shared utilities
└── types/        # Global type definitions
```

## Tooling

- **Framework:** Next.js 15, React 19
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Linting/Formatting:** ESLint, Prettier
- **Git hooks:** Husky + lint-staged

## Coding Rules

### General Rules

- This project uses `pnpm`.
- When you need to use an icon while creating a UI, use `lucide-react`.

### Rules for the `/form` Subproject

- When creating a UI, apply **neobrutalism** styling.
- Create **primitive** components such as `button`, `label`, `input`, and `select`, and place them in `src/projects/form/components/primitive`. These components must wrap components from `@base-ui`.

### Rules for the `/performance` Subproject

No rules at the moment.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
