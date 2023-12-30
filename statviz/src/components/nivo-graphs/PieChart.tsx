import { ResponsivePie } from "@nivo/pie";
import { useEffect, useRef } from "react";
import {
  getMarginTop,
  getScaledExportFields,
  scaledNivoTheme,
} from "../../utils/theme";
import { percent } from "../../utils/chart";

export interface PieChart {
  width: string;
  height: string;
  data: Array<object>;
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  animate?: boolean;
  rendered?: () => void;
  onClick?: (node) => void;
}

export default function PieChart(chart: PieChart) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;

    chart.rendered();
  }, [ref]);

  const height = parseInt(chart.height);
  const width = parseInt(chart.width);

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

  const exportInfoStyles = getScaledExportFields(
    width,
    height,
    margin.top,
    includeHeading
  );
  const layers = ["arcs", "arcLinkLabels", "arcLabels", "legends"];
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
    <div ref={ref} style={{ width: chart.width, height: chart.height }}>
      <ResponsivePie
        data={chart.data}
        margin={margin}
        borderWidth={0}
        arcLabel="value"
        innerRadius={0.4}
        layers={layers}
        padAngle={0.7}
        cornerRadius={3}
        animate={chart.animate === true || chart.animate === null}
        onClick={chart.onClick}
        theme={theme}
        isInteractive
        activeOuterRadiusOffset={2}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLinkLabel={arcLabel}
        arcLinkLabelsDiagonalLength={10}
        arcLinkLabelsStraightLength={16}
      />
    </div>
  );
}
