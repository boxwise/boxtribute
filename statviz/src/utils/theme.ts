import { extendTheme } from "@chakra-ui/react";
import { Theme } from "@nivo/core";
import { defaultStyles } from "@visx/tooltip";

export const getSelectionBackground = (selected: boolean) =>
  selected ? "blue.100" : "white";

const colors = {
  brandRed: {
    300: "#ef404a",
    200: "#f37167",
    100: "#f8aa9e",
  },
  brandBlue: {
    300: "#29335f",
    200: "#315c88",
    100: "#aacfe3",
  },
  brandYellow: {
    300: "#d89016",
    200: "#e4aa4f",
    100: "#f4e6a0",
  },
  brandGray: "#848689",
  // this was additional generated on https://coolors.co/ to have a fitting green
  brandGreen: "#60a561",
};

export const theme = extendTheme({
  colors,
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 0,
      },
      // TODO: we need to define our brand color palette and apply a whole colorScheme to config chakra UI properly.
      variants: {
        blue: {
          bg: "brandBlue.300",
          color: "white",
          borderRadius: 0,
        },
        green: {
          bg: "brandGreen",
          color: "white",
          borderRadius: 0,
        },
        gray: {
          bg: "brandGray",
          color: "white",
          borderRadius: 0,
        },
      },
    },
    Link: {
      // baseStyle: {
      //   color: "blue",
      //   textDecoration: "underline",
      // },
      variants: {
        "inline-link": {
          color: "blue",
          textDecoration: "underline",
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "bold",
      },
    },
    // This is fix for https://github.com/chakra-ui/chakra-ui/issues/2925
    Radio: {
      baseStyle: {
        label: {
          pointerEvents: "none",
        },
      },
    },
    Checkbox: {
      baseStyle: {
        label: {
          pointerEvents: "none",
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "transparent",
        borderRadius: "0",
      },
      shadows: "none",
      sizes: {
        lg: {
          field: {
            borderRadius: "none",
          },
        },
      },
    },
  },
});

export const nivoScheme: Theme = {
  background: "#ffffff",
  fontFamily: "Open Sans",
  text: {
    fontSize: 11,
    fill: "#333333",
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  axis: {
    domain: {
      line: {
        stroke: "#777777",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {
        stroke: "#777777",
        strokeWidth: 1,
      },
      text: {
        fontSize: 11,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "#dddddd",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    text: {
      fontSize: 11,
      fill: "#333333",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: "#333333",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    link: {
      stroke: "#000000",
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    outline: {
      stroke: "#000000",
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    symbol: {
      fill: "#000000",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

export const scaledNivoTheme = (width: number, height: number): Theme => {
  const strokeWidth = Math.floor(height / 500) + 1;
  const fontSizeAxis = Math.floor(height / 35) + 1;
  const fontSizeLegend = Math.floor(height / 25) + 1;
  const fontSizeText = Math.floor(height / 25) + 1;
  const fontSizeLabel = Math.floor(width / 25) + 1;

  return {
    background: "#ffffff",
    fontFamily: "Open Sans",
    text: {
      fontSize: fontSizeText,
      fill: "#333333",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    labels: {
      text: {
        fontSize: fontSizeLabel,
      },
    },
    axis: {
      domain: {
        line: {
          stroke: "#777777",
          strokeWidth: strokeWidth,
        },
      },
      legend: {
        text: {
          fontSize: fontSizeLegend,
          fill: "#333333",
          outlineWidth: 0,
          outlineColor: "transparent",
        },
      },
      ticks: {
        line: {
          stroke: "#777777",
          strokeWidth: strokeWidth,
        },
        text: {
          fontSize: fontSizeAxis,
          fill: "#333333",
          outlineWidth: 0,
          outlineColor: "transparent",
        },
      },
    },
    grid: {
      line: {
        stroke: "#dddddd",
        strokeWidth: strokeWidth,
      },
    },
    legends: {
      title: {
        text: {
          fontSize: fontSizeLegend,
          fill: "#333333",
          outlineWidth: 0,
          outlineColor: "transparent",
        },
      },
      text: {
        fontSize: fontSizeLegend,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
      ticks: {
        line: {},
        text: {
          fontSize: fontSizeLegend,
          fill: "#333333",
          outlineWidth: 0,
          outlineColor: "transparent",
        },
      },
    },
    annotations: {
      text: {
        fontSize: fontSizeLegend,
        fill: "#333333",
        outlineWidth: 2,
        outlineColor: "#ffffff",
        outlineOpacity: 1,
      },
      link: {
        stroke: "#000000",
        strokeWidth: 1,
        outlineWidth: 2,
        outlineColor: "#ffffff",
        outlineOpacity: 1,
      },
      outline: {
        stroke: "#000000",
        strokeWidth: 2,
        outlineWidth: 2,
        outlineColor: "#ffffff",
        outlineOpacity: 1,
      },
      symbol: {
        fill: "#000000",
        outlineWidth: 2,
        outlineColor: "#ffffff",
        outlineOpacity: 1,
      },
    },
    tooltip: {
      container: {
        background: "#ffffff",
        fontSize: fontSizeLegend,
      },
      basic: {},
      chip: {},
      table: {},
      tableCell: {},
      tableCellValue: {},
    },
  };
};

export const scaledExportFieldsVisX = (width: number, height: number) => {
  const headingFontSize = Math.floor((width + height) / 40);
  const fontSize = Math.floor((width + height) / 90);

  return {
    heading: {
      style: {
        fontSize: headingFontSize,
        fontFamily: "Open Sans",
      },
      x: Math.floor(width * 0.05),
      y: 30,
    },
    timerange: {
      style: {
        fontSize: fontSize,
        fontFamily: "Open Sans",
      },
      x: Math.floor(width * 0.05),
      y: fontSize * 4,
    },
    timestamp: {
      style: {
        fontSize: fontSize,
        fontFamily: "Open Sans",
      },
      x: 30,
      y: height,
    },
  };
};

export const scaledExportFieldsNivo = (width: number, height: number) => {
  const headingFontSize = Math.floor(width / 20);
  const fontSize = Math.floor(width / 40);

  return {
    heading: {
      style: {
        fontSize: headingFontSize,
        fontFamily: "Open Sans",
      },
      x: width * 0.05,
      y: 30,
    },
    timerange: {
      style: {
        fontSize: fontSize,
        fontFamily: "Open Sans",
      },
      x: width * 0.05,
      y: fontSize * 4,
    },
    timestamp: {
      style: {
        fontSize: fontSize,
        fontFamily: "Open Sans",
      },
      x: 30,
      y: height,
    },
  };
};

export const scaleTick = (height: number) => height / 80;
export const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: "white",
  width: 152,
  height: 32,
  padding: 6,
  fontSize: 14,
};
export const tickProps = {
  fontSize: 12,
};
