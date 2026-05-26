# Step 5: husky-setup

Installs Husky + lint-staged and configures a pre-commit hook that runs type-checking, linting, and a build.

## Instructions

- Install dev dependencies:
  ```sh
  pnpm i -D husky lint-staged
  ```
- Add to `package.json` scripts (if not already present from step 1):
  ```json
  "===== SETUP =====": "",
  "husky:install": "husky"
  ```
- Add the lint-staged config to `package.json` at the top level (not inside `scripts`):
  ```json
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint"
    ]
  }
  ```
- Run:
  ```sh
  npm run husky:install
  ```
- Create or overwrite `.husky/pre-commit`:
  ```sh
  npm run build:ts
  npx lint-staged
  npm run build
  ```
