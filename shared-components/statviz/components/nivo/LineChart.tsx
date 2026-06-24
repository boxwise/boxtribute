import { DefaultSeries, LineSvgLayer, LineSvgProps, ResponsiveLine } from "@nivo/line";
import { useEffect, useRef } from "react";
import {
  getMarginTop,
  getScaledExportFields,
  scaleTick,
  scaledNivoTheme,
} from "../../../utils/theme";
import { percent } from "../../utils/chart";

export interface ILineChartDataPoint {
  x: string;
  y: number;
}

export interface ILineChartSeries {
  id: string;
  data: ILineChartDataPoint[];
}

export interface ILineChart {
  width: string;
  height: string;
  data: ILineChartSeries[];
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  animate?: boolean;
  labelAxisBottom?: string;
  labelAxisLeft?: string;
  rendered?: (ref: HTMLDivElement) => void;
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
  const width = parseInt(chart.width, 10);

  const theme = scaledNivoTheme(width, height, chart.data.length);
  const marginBottom = percent(height, 30);

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";
  const marginTop = getMarginTop(height, width, includeHeading, includeTimerange);

  const exportInfoStyles = getScaledExportFields(width, height, marginTop, includeHeading);

  const layers: LineSvgLayer<DefaultSeries>[] = [
    "grid",
    "markers",
    "axes",
    "areas",
    "lines",
    "points",
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

  const commonProps: Omit<LineSvgProps<DefaultSeries>, "data" | "width" | "height"> = {
    margin: {
      top: marginTop,
      right: percent(width, 10),
      bottom: marginBottom,
      left: percent(width, 10),
    },
    xScale: { type: "point" },
    yScale: { type: "linear", min: 0, max: "auto", stacked: false },
    animate: chart.animate === true || chart.animate === null,
    theme,
    layers,
    axisBottom: {
      tickSize: scaleTick(height),
      tickPadding: scaleTick(height),
      tickRotation: 45,
      legend: chart.labelAxisBottom,
      legendPosition: "middle",
      legendOffset: 36,
    },
    axisLeft: {
      tickSize: scaleTick(height),
      tickPadding: scaleTick(height),
      tickRotation: 0,
      legend: chart.labelAxisLeft,
      legendPosition: "middle",
      legendOffset: -40,
    },
    pointSize: 6,
    pointBorderWidth: 2,
    pointBorderColor: { from: "serieColor" },
    useMesh: true,
  };

  return (
    <div ref={ref} style={{ width: chart.width, height: chart.height }}>
      <ResponsiveLine data={chart.data} {...commonProps} />
    </div>
  );
}
