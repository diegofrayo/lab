---
name: project-setup
description: Automates the initial setup of a new project. Use this skill when the user says "project-setup", "setup project", "run project setup", "initialize project", "set up my project", or asks to run any of the project setup steps (initial-setup, typescript-setup, eslint-setup, prettier-setup, husky-setup). Always invoke this skill when the user wants to bootstrap or initialize a new project from scratch.
disable-model-invocation: true
---

# Project Setup

This skill automates the initial setup of a new project through 5 sequential steps.

## Steps

| #   | Name             | Description                                                                           |
| --- | ---------------- | ------------------------------------------------------------------------------------- |
| 1   | initial-setup    | Base project pnpm, Tailwind CSS, core dependencies and the framework the user chooses |
| 2   | typescript-setup | TypeScript v6+ with strict `tsconfig.json`                                            |
| 3   | eslint-setup     | ESLint flat config with JS, TS, React, and CSS rules                                  |
| 4   | prettier-setup   | Prettier with import-sorting and Tailwind plugins                                     |
| 5   | husky-setup      | Husky + lint-staged pre-commit hook                                                   |

## How to run

For each step in order:

1. Ask: "**Step N: `<step-name>`** — <description from table above>. Do you want to execute this step? (yes/no)"
2. If **yes**: read `references/N-<step-name>.md` and follow its instructions exactly.
3. If **no**: skip and move to the next step.
4. After all steps, summarize what was executed and what was skipped.
