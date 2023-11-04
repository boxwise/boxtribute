import { ResponsiveBar, BarDefaultProps, BarDatum, BarLayer } from "@nivo/bar";
import { nivoScheme, scaleTick, scaledNivoTheme } from "../../utils/theme";
import { percent, pixelCalculator } from "../../utils/chart";
import { useTheme } from "@nivo/core";
import { forwardRef, useRef } from "react";

export interface BarChart {
  width: string;
  height: string;
  data: Array<object>;
  visId: string;
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  keys?: Array<string>;
  animate?: boolean; // null defaults to true
  indexBy?: string;
  ariaLabel?: string;
  legend?: boolean;
  labelAxisBottom?: string;
  labelAxisLeft?: string;
}

export default function BarChart(barChart: BarChart) {
  const height = parseInt(barChart.height);
  const width = parseInt(barChart.width);

  const theme = scaledNivoTheme(width, height);
  // getting updated depending on how much space is needed for extra information e. g. Timestamp and Heading
  let marginTop = percent(height, 5);
  let marginBottom = percent(height, 25);

  const layers: BarLayer<BarDatum>[] = [
    "grid",
    "axes",
    "bars",
    "markers",
    "legends",
    "annotations",
  ];

  if (typeof barChart.heading === "string") {
    const size = Math.floor(width / 20);

    marginTop += size * 2.5;
    layers.push(() => {
      return (
        <text
          x={width * 0.05 * -1}
          y={-size * 1.5}
          style={{
            ...theme.labels?.text,
            fontSize: size,
            fontFamily: "Open Sans",
          }}
        >
          {barChart.heading}
        </text>
      );
    });
  }
  if (typeof barChart.timerange === "string") {
    const size = Math.floor(width / 50);

    marginTop += size * 3;
    layers.push(() => {
      return (
        <text
          x={width * 0.05 * -1}
          y={-size * 2}
          style={{
            ...theme.labels?.text,
            fontSize: size,
            fontFamily: "Open Sans",
          }}
        >
          {barChart.timerange}
        </text>
      );
    });
  }
  if (typeof barChart.timestamp === "string") {
    marginBottom += 20;
    const y = height - marginTop - 20;
    layers.push(() => {
      return (
        <text
          x="-30"
          y={y}
          style={{
            ...theme.labels?.text,
            fontSize: 14,
            fontFamily: "Open Sans",
          }}
        >
          {barChart.timestamp}
        </text>
      );
    });
  }

  const legend =
    barChart.legend === true
      ? [
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: "hover",
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]
      : [];

  return (
    <div
      id={barChart.visId}
      style={{ width: barChart.width, height: barChart.height }}
    >
      <ResponsiveBar
        data={barChart.data}
        keys={barChart.keys}
        animate={barChart.animate === true || barChart.animate === null}
        indexBy={barChart.indexBy}
        margin={{
          top: marginTop,
          right: percent(width, 10),
          bottom: marginBottom,
          left: percent(width, 15),
        }}
        layers={layers}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        theme={theme}
        colors="#ec5063"
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "#38bcb2",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "#eed312",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: scaleTick(height),
          tickPadding: scaleTick(height),
          tickRotation: 25,
          legend: barChart.labelAxisBottom,
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: scaleTick(height),
          tickPadding: scaleTick(height),
          tickRotation: 0,
          legend: barChart.labelAxisLeft,
          legendPosition: "middle",
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={legend}
        role="application"
        ariaLabel={barChart.ariaLabel}
        barAriaLabel={(e) =>
          e.id + ": " + e.formattedValue + " in country: " + e.indexValue
        }
      />
    </div>
  );
}
