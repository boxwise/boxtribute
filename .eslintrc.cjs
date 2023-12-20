module.exports = {
  // It does not look for a configuration file upwards from the root directory.
  root: true,
  // This defines env variables
  env: { browser: true, es2020: true },
  // ignore linting for these files
  ignorePatterns: ["dist", ".eslintrc.cjs", ".eslintrc"],
  // loads settings and rules from other eslint configs
  extends: ["plugin:import/recommended", "plugin:import/typescript"],
  settings: {
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
        project: ["**/tsconfig*.json"],
      },
    },
  },
  rules: {
    // ensure that all modules that are imported are actually declared in a package.json file
    "import/no-extraneous-dependencies": [
      "error",
      {
        // look for package.json files also in the parent directory
        packageDir: ["./", "../"],
        // importing devDependencies in these files is ok
        devDependencies: [
          "**/tests/**",
          "**/*.test.{ts,tsx}", // tests where the extension or filename suffix denotes that it is a test
          "**/jest.config.ts", // jest config
          "**/jest.setup.ts", // jest setup
          "customEslintImportResolver.js", // eslint config
        ],
      },
    ],
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
};
