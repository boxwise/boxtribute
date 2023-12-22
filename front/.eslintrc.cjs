module.exports = {
  extends: ["../.eslintrc.cjs"],
  rules: {
    // PLEASE DO NOT ADD OTHER RULES
    // This file is only used so that the import plugin can resolve imports correctly

    // ensure that all modules that are imported are actually declared in a package.json file
    "import/no-extraneous-dependencies": [
      "error",
      {
        // look for package.json files also in the parent directory
        packageDir: ["./", "../"],
        // importing devDependencies in these files is ok
        devDependencies: [
          "**/mocks/**",
          "**/tests/**",
          "**/*.test.{ts,tsx}", // tests where the extension or filename suffix denotes that it is a test
          "**/jest.config.ts", // jest config
          "**/jest.setup.ts", // jest setup
          "customEslintImportResolver.js", // eslint config
        ],
      },
    ],
  },
};
