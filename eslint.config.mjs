import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/public/**",
      "**/*.js",
      "**/*.old.*",
      "**/react-table-config.d.ts",
      "**/generated/**",
      "**/graphql.ts",
      "**/vite.config.ts",
      "eslint.config.mjs",
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript ESLint config (eslintRecommended disables ESLint rules handled by TypeScript)
  // Note: Using eslintRecommended to match original config, not the stricter 'recommended'
  tseslint.configs.eslintRecommended,

  // Main configuration for all TypeScript/React files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    settings: {
      react: { version: "detect" },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
          moduleDirectory: ["node_modules", "src"],
        },
        typescript: {
          alwaysTryTypes: true,
          project: ["./*/tsconfig.json", "./tsconfig.json"],
        },
      },
    },
    rules: {
      // TypeScript ESLint rules
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
      ],

      // React rules
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // JSX A11y rules
      ...jsxA11yPlugin.configs.recommended.rules,

      // Import rules
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: [__dirname],
        },
      ],
      "import/no-unresolved": [2, { caseSensitive: true }],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
    },
  },

  // Configuration for front package
  {
    files: ["front/**/*.ts", "front/**/*.tsx"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: [path.join(__dirname, "front"), __dirname],
        },
      ],
    },
  },

  // Configuration for shared-components package
  {
    files: ["shared-components/**/*.ts", "shared-components/**/*.tsx"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: [path.join(__dirname, "shared-components"), __dirname],
        },
      ],
    },
  },

  // Configuration for shared-front package
  {
    files: ["shared-front/**/*.ts", "shared-front/**/*.tsx"],
    plugins: {
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: [path.join(__dirname, "shared-front"), __dirname],
        },
      ],
      // React Refresh rules (originally only in shared-front)
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Configuration for test files
  {
    files: [
      "**/?(__)tests?(__)/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "**/mocks/**/*.[jt]s?(x)",
    ],
    plugins: {
      "testing-library": testingLibraryPlugin,
    },
    rules: {
      ...testingLibraryPlugin.configs.react.rules,
    },
  },

  // Prettier config (must be last to override formatting rules)
  prettierConfig
);
