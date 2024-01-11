import { ResponsiveSankey } from "@nivo/sankey";
import { useEffect, useRef } from "react";
import { getMarginTop, getScaledExportFields, scaledNivoTheme } from "../../../Utils/theme";
import { percent } from "../../utils/chart";

export interface ISankeyChart {
  width: string;
  height: string;
  data: {
    nodes: Array<{ id: string }>;
    links: Array<{ source: string; target: string; value: number }>;
  };
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  rendered?: () => void;
}

export default function SankeyChart(chart: ISankeyChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;

    chart.rendered();
  }, [ref]);

  const width = parseInt(chart.width, 10);
  const height = parseInt(chart.height, 10);

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";

  const margin = {
    top: getMarginTop(height, width, includeHeading, includeTimerange),
    right: percent(width, 5),
    bottom: percent(height, 5),
    left: percent(width, 5),
  };

  const theme = {
    ...scaledNivoTheme(width, height),
    labels: {
      text: {
        fontSize: Math.ceil((width + height) / 100),
      },
    },
  };

  const exportInfoStyles = getScaledExportFields(width, height, margin.top, includeHeading);

  const layers = ["labels", "legend", "nodes", "links"];

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
      <ResponsiveSankey
        colors={{ scheme: "category10" }}
        layers={layers}
        margin={{ ...margin }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        sort="auto"
        enableLinkGradient
        label={(e) => `${e.name} ${e.value}`}
        labelPosition="inside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1]],
        }}
        theme={theme}
        data={chart.data}
      />
    </div>
  );
}
