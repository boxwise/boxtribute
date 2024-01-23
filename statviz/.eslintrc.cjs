const path = require("path");

module.exports = {
  extends: ["../.eslintrc.cjs"],
  // TODO: move up to root
  plugins: ["react-refresh"],
  rules: {
    // This needed to resolve dependencies correctly
    "import/no-extraneous-dependencies": [
      "error",
      {
        // look for package.json files also in the parent directory
        packageDir: [__dirname, path.join(__dirname, "../")],
      },
    ],
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  },
};
