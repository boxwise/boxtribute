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
      // Workaround for issue in d3 https://github.com/plouc/nivo/issues/2310
      { find: "@nivo/annotations", replacement: "@nivo/annotations/dist/nivo-annotations.es.js" },
      { find: "@nivo/arcs", replacement: "@nivo/arcs/dist/nivo-arcs.es.js" },
      { find: "@nivo/axes", replacement: "@nivo/axes/dist/nivo-axes.es.js" },
      { find: "@nivo/bar", replacement: "@nivo/bar/dist/nivo-bar.es.js" },
      { find: "@nivo/colors", replacement: "@nivo/colors/dist/nivo-colors.es.js" },
      { find: "@nivo/core", replacement: "@nivo/core/dist/nivo-core.es.js" },
      { find: "@nivo/legends", replacement: "@nivo/legends/dist/nivo-legends.es.js" },
      { find: "@nivo/line", replacement: "@nivo/line/dist/nivo-line.es.js" },
      { find: "@nivo/pie", replacement: "@nivo/pie/dist/nivo-pie.es.js" },
      { find: "@nivo/recompose", replacement: "@nivo/recompose/dist/nivo-recompose.es.js" },
      { find: "@nivo/scales", replacement: "@nivo/scales/dist/nivo-scales.es.js" },
      { find: "@nivo/scatterplot", replacement: "@nivo/scatterplot/dist/nivo-scatterplot.es.js" },
      { find: "@nivo/tooltip", replacement: "@nivo/tooltip/dist/nivo-tooltip.es.js" },
      { find: "@nivo/voronoi", replacement: "@nivo/voronoi/dist/nivo-voronoi.es.js" },
      { find: "@nivo/sankey", replacement: "@nivo/sankey/dist/nivo-sankey.es.js" },
    ],
  },
});
