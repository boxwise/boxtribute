import { ResponsiveBar } from "@nivo/bar";
import { nivoScheme } from "../../utils/theme";

export interface BarChart {
  width: string;
  height: string;
  data: Array<object>;
  visId: string;
  keys?: Array<string>;
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
        indexBy={barChart.indexBy}
        margin={{ top: 50, right: 50, bottom: 100, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        theme={nivoScheme}
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
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 25,
          legend: barChart.labelAxisBottom,
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
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
