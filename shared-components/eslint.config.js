import { fileURLToPath } from "url";
import path from "path";
import rootConfig from "../eslint.config.js";
import importPlugin from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...rootConfig
    .map((config) => {
      // Skip the import plugin config to override it
      if (config.plugins?.import) {
        return null;
      }
      return config;
    })
    .filter(Boolean),
  {
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: path.join(__dirname, "tsconfig.json"),
        },
      },
    },
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: [__dirname, path.join(__dirname, "../")],
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
];
