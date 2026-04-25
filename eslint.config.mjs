import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { fixupPluginRules } from "@eslint/compat";
import { reactRefresh } from "eslint-plugin-react-refresh";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // 1. Global Ignores (Replaces ignorePatterns)
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/.eslintrc.config.cjs",
      "**/vite.config.ts",
      "**/generated/**",
      "**/graphql.ts",
      "back/scripts/**",
      "front/public/**",
      "shared-front/public/**",
      "eslint.config.mjs",
    ],
  },

  // 2. Base Configuration for JS/TS/React
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./*/tsconfig.json", "./tsconfig.json"],
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": fixupPluginRules(hooksPlugin),
      "jsx-a11y": jsxA11yPlugin,
      import: fixupPluginRules(importPlugin),
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./*/tsconfig.json", "./tsconfig.json"],
        },
        node: {
          extensions: [".ts", ".tsx"],
          moduleDirectory: ["node_modules", "src"],
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,

      // Custom Rules
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
      ],
      "react/react-in-jsx-scope": "off",
      "no-undef": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
      "import/no-extraneous-dependencies": ["error"],
      "import/no-unresolved": ["error", { caseSensitive: true }],
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
      //TODO This is done so that 'any' types can be change slowly, and not all at once
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-wrapper-object-types": "error",
    },
  },

  // 3. Testing Overrides
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

  //sub-stuff
  {
    files: ["front/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          // look for package.json files also in the parent directory
          packageDir: [path.resolve(__dirname, "front"), __dirname],
        },
      ],
    },
  },

  {
    files: ["shared-components/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          // look for package.json files also in the parent directory
          packageDir: [path.resolve(__dirname, "shared-components"), __dirname],
        },
      ],
    },
  },

  {
    files: ["shared-front/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "react-refresh": reactRefresh.plugin,
    },
    rules: {
      // This needed to resolve dependencies correctly
      "import/no-extraneous-dependencies": [
        "error",
        {
          // look for package.json files also in the parent directory
          packageDir: [path.resolve(__dirname, "shared-front"), __dirname],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // 4. Prettier (Must be last to override formatting)
  prettierConfig,
];
