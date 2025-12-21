import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["front/vite.config.ts", "shared-components/vitest.config.ts"],
  },
});
