import { ParentSize } from "@visx/responsive";
import { ResponsivePie, PieLayer } from "@nivo/pie";
import { useEffect, useRef } from "react";
import {
  breakText,
  getBaseFontSize,
  getMarginTop,
  getScaledExportFields,
  scaledNivoTheme,
} from "../../../utils/theme";
import { percent } from "../../utils/chart";

export interface IPieChart {
  width: string;
  height: string;
  data: Array<object>;
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  animate?: boolean;
  centerData?: {
    level: number;
    grouping: string;
  };
  rendered?: (ref: HTMLDivElement) => void;
  onClick?: (node) => void;
}

function PieChartInner(chart: Omit<IPieChart, "width"> & { width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;

    chart.rendered(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const height = parseInt(chart.height, 10);
  const width = chart.width;
  const baseFontSize = getBaseFontSize(width, height);

  const theme = scaledNivoTheme(width, height, 10);

  const arcLabel = (d) => {
    if (d.id.length > 10) {
      const cuttedString = d.id.split("").splice(0, 10).join("");
      return `${cuttedString}...`;
    }
    return d.id;
  };

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";

  const margin = {
    top: getMarginTop(height, width, includeHeading, includeTimerange),
    right: percent(width, 20),
    bottom: percent(height, 20),
    left: percent(width, 20),
  };

  const exportInfoStyles = getScaledExportFields(width, height, margin.top, includeHeading);
  const layers: PieLayer<object>[] = ["arcs", "arcLinkLabels", "arcLabels", "legends"];
  if (includeHeading) {
    layers.push(() => <text {...exportInfoStyles.heading}>{chart.heading}</text>);
  }
  if (typeof chart.timerange === "string") {
    layers.push(() => <text {...exportInfoStyles.timerange}>{chart.timerange}</text>);
  }
  if (typeof chart.timestamp === "string") {
    layers.push(() => <text {...exportInfoStyles.timestamp}>{chart.timestamp}</text>);
  }
  if (chart.centerData) {
    const y = (height - margin.top - margin.bottom) / 1.8;
    const x = (width - margin.right - margin.left) / 2;
    const textMaxWidth = baseFontSize * 7; // same as 7em
    const fontSizeGroupingText = baseFontSize * 0.8; // 0.8em
    const textInLines = breakText(chart.centerData!.grouping, textMaxWidth, fontSizeGroupingText);
    layers.push(() => (
      <g transform={`translate(${x}, ${y})`} style={{ whiteSpace: "pre" }}>
        <text
          style={{ textAnchor: "middle", fontSize: "2.7em" }}
          transform={`translate(0, -${baseFontSize * 1.5})`}
        >
          {chart.centerData?.level}
        </text>
        <text
          style={{ fontSize: "0.8em", textAnchor: "middle" }}
          transform={`translate(0, ${baseFontSize * 0.2})`}
        >
          {textInLines}
        </text>
      </g>
    ));
  }

  return (
    <div ref={ref} style={{ width: chart.width, height: chart.height, fontSize: baseFontSize }}>
      <ResponsivePie
        data={chart.data}
        margin={margin}
        borderWidth={0}
        arcLabel="value"
        innerRadius={0.6}
        layers={layers}
        padAngle={0.7}
        cornerRadius={3}
        animate={chart.animate === true || chart.animate === null}
        onClick={chart.onClick}
        theme={theme}
        // colors={{ scheme: 'tableau10' }}
        isInteractive
        activeOuterRadiusOffset={2}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLinkLabel={arcLabel}
        arcLinkLabelsDiagonalLength={20}
        arcLinkLabelsStraightLength={16}
      />
    </div>
  );
}

export default function PieChart(chart: IPieChart) {
  const isPercentWidth = String(chart.width).endsWith("%");

  if (isPercentWidth) {
    return (
      <div style={{ width: chart.width, height: chart.height }}>
        <ParentSize>
          {({ width: measuredWidth }) => <PieChartInner {...chart} width={measuredWidth} />}
        </ParentSize>
      </div>
    );
  }

  return <PieChartInner {...chart} width={parseInt(chart.width, 10)} />;
}
