import { ResponsiveLine, LineSeries, LineSvgLayer } from "@nivo/line";
import { useEffect, useRef } from "react";
import {
  getBaseFontSize,
  getMarginTop,
  getScaledExportFields,
  scaledNivoTheme,
} from "../../../utils/theme";
import { percent } from "../../utils/chart";

export interface ILineChart {
  width: string;
  height: string;
  data: LineSeries[];
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  animate?: boolean;
  rendered?: (ref: HTMLDivElement) => void;
  colors?: string[];
}

export default function LineChart(chart: ILineChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;

    chart.rendered(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const height = parseInt(chart.height, 10);
  const isPercentWidth = chart.width.endsWith("%");
  const width = isPercentWidth ? 800 : parseInt(chart.width, 10);
  const baseFontSize = getBaseFontSize(width, height);
  const theme = scaledNivoTheme(width, height, Math.max(chart.data.length, 5));

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";
  const marginTop = getMarginTop(height, width, includeHeading, includeTimerange);
  const exportInfoStyles = getScaledExportFields(width, height, marginTop, includeHeading);

  const layers: LineSvgLayer<LineSeries>[] = [
    "grid",
    "markers",
    "axes",
    "areas",
    "crosshair",
    "lines",
    "slices",
    "points",
    "mesh",
    "legends",
  ];

  if (includeHeading) {
    layers.push(() => <text {...exportInfoStyles.heading}>{chart.heading}</text>);
  }
  if (typeof chart.timerange === "string") {
    layers.push(() => <text {...exportInfoStyles.timerange}>{chart.timerange}</text>);
  }
  if (typeof chart.timestamp === "string") {
    layers.push(() => <text {...exportInfoStyles.timestamp}>{chart.timestamp}</text>);
  }

  return (
    <div ref={ref} style={{ width: chart.width, height: chart.height, fontSize: baseFontSize }}>
      <ResponsiveLine
        data={chart.data}
        margin={{
          top: marginTop,
          right: percent(width, 5),
          bottom: percent(height, 28),
          left: percent(width, 10),
        }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickRotation: -45,
          legendOffset: 36,
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickRotation: 0,
          legendOffset: -40,
        }}
        enableGridY={false}
        pointSize={8}
        pointBorderWidth={2}
        pointColor={{ theme: "background" }}
        pointBorderColor={{ from: "serieColor" }}
        useMesh
        enableSlices="x"
        legends={[]}
        layers={layers}
        theme={theme}
        colors={chart.colors ?? { scheme: "nivo" }}
        animate={chart.animate === true || chart.animate === null}
      />
    </div>
  );
}
