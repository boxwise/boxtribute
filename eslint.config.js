import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import testingLibrary from "eslint-plugin-testing-library";
import prettierConfig from "eslint-config-prettier";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";

export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  prettierConfig,

  // Global settings
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
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
  },

  // Import plugin configuration
  {
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      "import/no-extraneous-dependencies": ["error"],
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

  // React Hooks plugin configuration
  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Custom rules
  {
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
    },
  },

  // Testing Library configuration for test files
  {
    files: [
      "**/?(__)tests?(__)/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "**/mocks/**/*.[jt]s?(x)",
    ],
    plugins: {
      "testing-library": testingLibrary,
    },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/.eslintrc.cjs",
      "**/eslint.config.js",
      "**/generated/**",
      "**/.venv/**",
      "**/public/**",
      "**/*.old.*",
      "**/react-table-config.d.ts",
      "**/graphql.ts",
      "**/vite.config.ts",
      "**/*.config.ts",
      "**/*.config.js",
    ],
  },
);
