import { extendTheme } from "@chakra-ui/react";
import { Theme } from "@nivo/core";
import { defaultStyles } from "@visx/tooltip";
import { percent } from "../statviz/utils/chart";

export const getSelectionBackground = (selected: boolean) => (selected ? "blue.100" : "white");

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

export const scaledNivoTheme = (width: number, height: number, scaleFactor: number = 5): Theme => {
  const strokeWidth = Math.ceil(height / 900);
  const fontSizeAxis = Math.ceil(height / 35);
  const fontSizeLegend = Math.ceil(height / 35);
  const fontSizeText = Math.ceil(height / 35);
  const fontSizeLabel = Math.ceil(width / (scaleFactor * 4.5));

  return {
    background: "#ffffff",
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
          strokeWidth,
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
          strokeWidth,
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
        strokeWidth,
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

// Calculate margins, fontSizes, and styles for additional information that can be displayed in an exported image
export const graphMarginTopPercent = 10;
export const graphMarginBottomPercent = 20;
export const graphMarginRightPercent = 5;
export const graphMarginLeft = (width: number) => percent(width, 10);

// Extra margins needed between the graph and top of the image to display additional information
const getMarginHeader = (headingFontSize: number) => headingFontSize * 1.1;
const getMarginTimerange = (timeRangeFontSize: number) => timeRangeFontSize * 1.1;

// Calculate font sizes in dependence of the image size
const headingFontSize = (width: number, height: number) => Math.ceil((width + height) / 50);

const timeRangeFontSize = (width: number, height: number) => Math.ceil((width + height) / 90);

const timeStampFontSize = (width: number, height: number) => Math.ceil((width + height) / 90);

// This new approach to text scaling should be applied to other visualizations (heading etc.) in the future
// It calculates the baseFontSize to the root div element and lets you easily calculate
// the text size relative to it (works basically like to em unit in css)
export const getBaseFontSize = (width: number, height: number) => {
  const vmin = width < height ? width : height;
  return (vmin / 100) * 3;
};

// Note: SVG features that allow to use auto breaking are not in widely adopted
export const breakText = (text: string, maxWidth: number, fontSize: number) => {
  const averageCharacterWidth = fontSize * 0.6; // estimate average character width
  const maxCharsPerLine = Math.floor(maxWidth / averageCharacterWidth);

  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];

  words.forEach((word, index) => {
    if (line.length + word.length > maxCharsPerLine && line.length > 0) {
      lines.push(line);
      line = "";
    }
    line = `${line} ${word}`;
    if (index === words.length - 1) {
      lines.push(line);
    }
  });

  return lines.join("\n");
};

const headingPosition = (height: number) => ({
  y: -percent(height, 10),
  x: 0,
});

const timeRangePosition = (width: number, height: number, hasHeading: boolean) => {
  if (hasHeading) {
    const hP = headingPosition(height);
    return {
      x: hP.x,
      y: hP.y + timeRangeFontSize(width, height) + percent(height, 1),
    };
  }
  return {
    x: -graphMarginLeft(width) + percent(width, 3),
    y: -percent(height, 5),
  };
};

const timeStampPosition = (width: number, height: number, marginTop: number) => ({
  x: -graphMarginLeft(width) + percent(width, 1),
  y: height - marginTop - percent(height, 1),
});

// Calculate margin between graph and top of the image needed
export const getMarginTop = (
  height: number,
  width: number,
  header: boolean,
  timerange: boolean,
) => {
  const marginTop = percent(height, 10);
  if (header && timerange) {
    return (
      getMarginHeader(headingFontSize(width, height)) +
      getMarginTimerange(timeRangeFontSize(width, height)) +
      marginTop
    );
  }
  if (header) {
    return getMarginHeader(headingFontSize(width, height)) + marginTop;
  }
  if (timerange) {
    return getMarginTimerange(timeRangeFontSize(width, height)) + marginTop;
  }
  return marginTop;
};

export const getScaledExportFields = (
  width: number,
  height: number,
  marginTop: number,
  heading: boolean,
) => ({
  heading: {
    style: {
      fontSize: headingFontSize(width, height),
    },
    ...headingPosition(height),
  },
  timerange: {
    style: {
      fontSize: timeRangeFontSize(width, height),
    },
    ...timeRangePosition(width, height, heading),
  },
  timestamp: {
    style: {
      fontSize: timeStampFontSize(width, height),
    },
    ...timeStampPosition(width, height, marginTop),
  },
  pieChartCenterText: {
    style: {
      fonteSize: {},
    },
  },
});

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
