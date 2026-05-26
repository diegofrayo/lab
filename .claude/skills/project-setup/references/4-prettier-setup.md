# Step 4: prettier-setup

Installs Prettier with import-sorting and Tailwind plugins, and creates `.prettierrc.js`.

## Instructions

- Install dev dependencies:
  ```sh
  pnpm i -D prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-tailwindcss
  ```
- Create `.prettierrc.js` at the project root:
  ```js
  export default {
    // global
    printWidth: 100,
    tabWidth: 2,
    useTabs: true,

    // common
    bracketSpacing: true,
    singleQuote: false,

    // js
    arrowParens: "always",
    semi: true,
    trailingComma: "all",

    // jsx
    bracketSameLine: false,
    singleAttributePerLine: true,

    // plugins
    plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],

    // plugin: @ianvs/prettier-plugin-sort-imports
    importOrder: [
      "<BUILTIN_MODULES>",
      "^react$",
      "<THIRD_PARTY_MODULES>",
      "",
      "^(@diegofrayo-pkg)(/.*)$",
      "",
      "^~/(.*)$",
      "",
      "^[./]",
      "",
      ".css$",
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators"],

    // plugin: prettier-plugin-tailwindcss
    tailwindFunctions: ["cva", "cn", "clsx", "tw"],
    tailwindAttributes: ["wrapperClassName", "contentClassName", "containerClassName"],
    tailwindPreserveWhitespace: false,
    tailwindPreserveDuplicates: false,
  };
  ```
