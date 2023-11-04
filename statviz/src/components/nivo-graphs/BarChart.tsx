import { ResponsiveBar, ResponsiveBarCanvas } from "@nivo/bar";
import { nivoScheme, scaleTick, scaledTheme } from "../../utils/theme";
import { percent, pixelCalculator } from "../../utils/chart";

export interface BarChart {
  width: string;
  height: string;
  data: Array<object>;
  visId: string;
  keys?: Array<string>;
  animate?: boolean; // null defaults to true
  indexBy?: string;
  ariaLabel?: string;
  legend?: boolean;
  labelAxisBottom?: string;
  labelAxisLeft?: string;
}

export default function BarChart(barChart: BarChart) {
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
          top: percent(parseInt(barChart.height), 5),
          right: percent(parseInt(barChart.width), 10),
          bottom: percent(parseInt(barChart.height), 20),
          left: percent(parseInt(barChart.width), 15),
        }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        theme={scaledTheme(parseInt(barChart.width), parseInt(barChart.height))}
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
          tickSize: scaleTick(parseInt(barChart.height)),
          tickPadding: scaleTick(parseInt(barChart.height)),
          tickRotation: 25,
          legend: barChart.labelAxisBottom,
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: scaleTick(parseInt(barChart.height)),
          tickPadding: scaleTick(parseInt(barChart.height)),
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
