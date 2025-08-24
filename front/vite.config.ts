/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(), 
    viteTsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: '../shared-components/assets/fonts/*',
          dest: 'fonts'
        },
        {
          src: '../shared-components/assets/icons/*',
          dest: '.'
        },
        {
          src: '../shared-components/assets/manifest.json',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Apollo GraphQL
          'apollo-vendor': ['@apollo/client', 'graphql'],
          // UI framework
          'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          // Data visualization libraries (largest chunks)
          'nivo-vendor': ['@nivo/bar', '@nivo/core', '@nivo/pie', '@nivo/sankey', '@nivo/sunburst'],
          'visx-vendor': ['@visx/axis', '@visx/event', '@visx/grid', '@visx/group', '@visx/responsive', '@visx/scale', '@visx/shape', '@visx/tooltip'],
          'victory-vendor': ['victory'],
          // QR code and camera libraries
          'qr-vendor': ['@zxing/browser', '@zxing/library'],
          // Utility libraries
          'utils-vendor': ['lodash', 'date-fns', 'zod'],
          // State management and forms
          'state-vendor': ['jotai', 'react-hook-form'],
          // Sentry error tracking
          'sentry-vendor': ['@sentry/react'],
        }
      }
    },
    chunkSizeWarningLimit: 800, // Increase warning limit since we're splitting chunks
  },
  server: {
    host: true,
    port: 3000,
  },
  envPrefix: "FRONT_",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setupTests.ts",
    // Junit is needed for CircleCI test results
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
  },
});
