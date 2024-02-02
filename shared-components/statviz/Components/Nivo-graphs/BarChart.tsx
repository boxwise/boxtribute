import { ResponsiveBar, BarDatum, BarLayer, BarLegendProps } from "@nivo/bar";
import { useRef, useEffect } from "react";
import {
  getMarginTop,
  getScaledExportFields,
  scaleTick,
  scaledNivoTheme,
} from "../../../utils/theme";
import { percent } from "../../utils/chart";

export interface IBarChart {
  width: string;
  height: string;
  data: BarDatum[];
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
  rendered?: () => void;
}

export default function BarChart(barChart: IBarChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    if (!barChart.rendered) return;

    barChart.rendered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const height = parseInt(barChart.height, 10);
  const width = parseInt(barChart.width, 10);

  const theme = scaledNivoTheme(width, height, barChart.data.length);
  const marginBottom = percent(height, 25);

  const layers: BarLayer<BarDatum>[] = [
    "grid",
    "axes",
    "bars",
    "markers",
    "legends",
    "annotations",
  ];

  const includeHeading = typeof barChart.heading === "string";
  const includeTimerange = typeof barChart.timerange === "string";
  const marginTop = getMarginTop(height, width, includeHeading, includeTimerange);

  const exportInfoStyles = getScaledExportFields(width, height, marginTop, includeHeading);

  if (includeHeading) {
    layers.push(() => <text {...exportInfoStyles.heading}>{barChart.heading}</text>);
  }
  if (typeof barChart.timerange === "string") {
    layers.push(() => <text {...exportInfoStyles.timerange}>{barChart.timerange}</text>);
  }
  if (typeof barChart.timestamp === "string") {
    layers.push(() => <text {...exportInfoStyles.timestamp}>{barChart.timestamp}</text>);
  }

  const legend: BarLegendProps[] =
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
    <div ref={ref} id={barChart.visId} style={{ width: barChart.width, height: barChart.height }}>
      <ResponsiveBar
        data={barChart.data}
        keys={barChart.keys}
        animate={barChart.animate === true || barChart.animate === null}
        indexBy={barChart.indexBy}
        margin={{
          top: marginTop,
          right: percent(width, 10),
          bottom: marginBottom,
          left: percent(width, 10),
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
          tickRotation: 45,
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
        labelSkipWidth={20}
        labelSkipHeight={20}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        legends={legend}
        role="application"
        ariaLabel={barChart.ariaLabel}
        barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in country: ${e.indexValue}`}
      />
    </div>
  );
}
