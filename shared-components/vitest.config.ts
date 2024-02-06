import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setupTests.ts",
    reporters: ["default", "junit"],
    outputFile: {
      junit: "./coverage/junit.xml",
    },
  },
});
