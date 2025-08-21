import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setupTests.ts",
    // @ts-expect-error TODO: check why this errors out
    reporters: ["default", "junit"],
    outputFile: {
      junit: "./coverage/junit.xml",
    },
    coverage: {
      exclude: [
        ".storybook/**",
        "build/**",
        "coverage/**",
        "dist/**",
        "node_modules/**",
        "public/**",
        "**/[.]**",
        "**/*.d.ts",
        "**/test?(s)/**",
        "test?(-*).?(c|m)[jt]s?(x)",
        "**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/vitest.{workspace,projects}.[jt]s?(on)",
        "**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}",
        "**/mocks/**",
        "src/views/Distributions/**",
      ],
    },
    alias: [
      // Legacy aliases for older nivo packages - remove if using modern versions with proper exports
    ],
  },
});
