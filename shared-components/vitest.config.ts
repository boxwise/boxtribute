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
