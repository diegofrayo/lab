# Step 2: typescript-setup

Installs TypeScript v6+ and configures a strict `tsconfig.json`.

## Instructions

- Install TypeScript v6+:
  ```sh
  pnpm i -D typescript
  ```
- Create or overwrite `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      // Type-checking
      "allowUnreachableCode": false,
      "allowUnusedLabels": false,
      "alwaysStrict": true,
      "erasableSyntaxOnly": true,
      "exactOptionalPropertyTypes": true,
      "noFallthroughCasesInSwitch": true,
      "noImplicitAny": true,
      "noImplicitReturns": true,
      "noImplicitThis": true,
      "noPropertyAccessFromIndexSignature": true,
      "noUncheckedIndexedAccess": true,
      "noUncheckedSideEffectImports": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "strict": true,
      "strictNullChecks": true,
      "useUnknownInCatchVariables": true,

      // Modules
      "paths": {
        "@diegofrayo-pkg/*": ["./src/lib/@diegofrayo-pkg/*"],
        "~/*": ["./src/*"]
      },
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "allowImportingTsExtensions": true,

      // JavaScript support
      "allowJs": true,
      "checkJs": true,

      // Language and Environment
      "jsx": "react-jsx",
      "target": "es2022",
      "lib": ["DOM", "DOM.ITERABLE", "ESNext"],
      "moduleDetection": "force",

      // Completeness
      "skipLibCheck": true,

      // Emit
      "noEmit": true,

      // Interop Constraints
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "isolatedModules": true,
      "verbatimModuleSyntax": true,

      // Projects
      "incremental": true,
      "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

      // Editor support
      "plugins": [{ "name": "next" }]
    },
    "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["node_modules"]
  }
  ```
