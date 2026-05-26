# Step 1: initial-setup

Sets up the base project using TanStack Start with pnpm, Tailwind CSS, and core dependencies.

## Instructions

- Ask the user for the framework to use and how to generate the initial setup.
- Ask the user for the project name. Use it as the `name` field in `package.json` and as the main title in `README.md`.
- Use `pnpm` as the package manager. (Skip if it is already installed)
- Set up Tailwind CSS v4+. (Skip if it is already installed)
- Install `react` and `react-dom` v19+. (Skip if it is already installed)
- Install runtime dependencies:
  ```sh
  pnpm i @base-ui/react class-variance-authority classnames lucide-react remeda tailwind-merge sonner
  ```
- Install dev dependencies:
  ```sh
  pnpm i -D @types/node @types/react @types/react-dom tsx
  ```
- Add these npm scripts to `package.json` (preserve the section separator keys):
  ```json
  "===== SETUP =====": "",
  "husky:install": "husky",
  "===== DEV =====": "",
  "dev": "portless <project-name> next dev",
  "build:ts": "tsc --noEmit",
  "===== PROD =====": "",
  "build": "next build",
  "start": "next start",
  "===== FORMATTING =====": "",
  "lint": "eslint",
  "format": "prettier --write \"./src/**/*.{ts,tsx,json,css,mjs,js}\""
  ```
- Create a `.gitignore` file. (Skip if it is already exists)
  ```
  # --- Tan stack start project ---

  # Dependencies
  node_modules

  # Build outputs
  dist
  .output
  .vinxi

  # Generated files
  src/routeTree.gen.ts
  .tanstack

  # OS
  .DS_Store

  # --- Next.js project ---

  # See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

  # dependencies
  /node_modules
  /.pnp
  .pnp.js

  # testing
  /coverage

  # next.js
  /.next/
  /out/

  # production
  /build

  # misc
  .DS_Store
  *.pem

  # debug
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*

  # local env files
  .env*.local

  # vercel
  .vercel

  # typescript
  *.tsbuildinfo
  next-env.d.ts
  ```
