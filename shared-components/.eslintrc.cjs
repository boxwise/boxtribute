const path = require("path");

// PLEASE DO NOT ADD CONFIG HERE
// Add config to ../.eslintrc.cjs instead
// This file is just needed to resolve dependencies correctly
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../.eslintrc.cjs"],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        // look for package.json files also in the parent directory
        packageDir: [__dirname, path.join(__dirname, "../")],
      },
    ],
  },
};
