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
| --------------- | --------------------------------------- |
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
