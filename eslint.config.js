const path = require("path");
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const hooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");
const testingLibraryPlugin = require("eslint-plugin-testing-library");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");
const { fixupPluginRules } = require("@eslint/compat");
const { reactRefresh } = require("eslint-plugin-react-refresh");

module.exports = [
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
      "eslint.config.js",
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
