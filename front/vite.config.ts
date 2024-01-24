/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  server: {
    host: true,
    port: 3000,
  },
  envPrefix: "FRONT_",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setupTests.ts",
    reporters: ["junit"],
    outputFile: {
      junit: "./coverage/junit.xml",
    },
    // coverage: {
    //   reporters:
    // }
  },
});
