module.exports = {
  // It does not look for a configuration file upwards from the root directory.
  root: true,
  // This defines env variables
  env: { browser: true, es2020: true },
  // ignore linting for these files
  ignorePatterns: ["dist", ".eslintrc.cjs", ".eslintrc"],
  // loads settings and rules from other eslint configs
  extends: [
    "eslint:recommended",
    // TODO: try out plugin:@typescript-eslint/recommended-type-checked
    "plugin:@typescript-eslint/eslint-recommended",
    // we generally want to follow the rules from airbnb as a base
    // --> the extension of airbnb should be last so that it cannot be overriden by other configs
    // airbnb uses the plugins eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y
    // --> we need to install these plugins as devDependencies and load their recommended settings first
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "airbnb",
    // put prettier config last so that it can override all formatting rules
    "prettier",
  ],
  // regarding @typescript-eslint: https://typescript-eslint.io/linting/typed-linting/monorepos
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./*/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  settings: {
    // --------- Import Plugin Settings ---------
    // This defines the parser to use for .ts and .tsx files
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    // this defines how eslint resolves import statements
    "import/resolver": {
      node: {
        // resolve imports with these extensions
        extensions: [".ts", ".tsx"],
        // look here for modules of import statements
        moduleDirectory: ["node_modules", "src"],
      },
      typescript: {
        // always try to resolve types
        alwaysTryTypes: true,
        // look here for tsconfig files
        project: ["./*/tsconfig.json"],
      },
    },
  },
  rules: {
    // --------- typescipt-eslint Plugin Rules ---------
    // enforce to have interfaces/type should start with "I".
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: true,
        },
      },
    ],
    // --------- React Plugin Rules ---------
    // we do not need to import React in every file
    "react/react-in-jsx-scope": "off",
    "react/jsx-props-no-spreading": "off",
    // TODO: turn this on
    "react/prop-types": "off",
    // matter of preference (allows to use props.propName instead of deconstructing props first)
    "react/destructuring-assignment": "off",
    // allow other than jsx extensions
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
    // --------- Import Plugin Rules ---------
    // ensure that all modules that are imported are actually declared in a package.json file
    "import/no-extraneous-dependencies": ["error"],
    // ensure that all modules that are imported can be resolved to a module on the local filesystem
    "import/no-unresolved": [2, { caseSensitive: true }],
    // if there is only a single export on a file, it does not have to be a default export
    "import/prefer-default-export": "off",
    // TODO: enable this rule at some point, we have quite a few circular imports due to type definitions being all over the place.
    "import/no-cycle": ["off"],
    // ensure consistent use of file extension within the import statements
    "import/extensions": [
      "error",
      // ignore rule when importing from packages
      "ignorePackages",
      // ignore rule when importing from .js, .jsx, .ts, .tsx files
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
  overrides: [
    {
      files: [
        "**/?(__)tests?(__)/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[jt]s?(x)",
        "**/mocks/**/*.[jt]s?(x)",
      ],
      extends: ["plugin:testing-library/react"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
