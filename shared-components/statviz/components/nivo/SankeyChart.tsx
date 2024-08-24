import { ResponsiveSankey, SankeyLayerId } from "@nivo/sankey";
import { useEffect, useRef } from "react";
import { getMarginTop, getScaledExportFields, scaledNivoTheme } from "../../../utils/theme";
import { percent } from "../../utils/chart";

export interface ISankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface ISankeyNode {
  id: string;
  name: string;
}

export interface ISankeyData {
  nodes: { id: string; name: string; nodeColor?: string }[];
  links: ISankeyLink[];
}

export interface ISankeyChart {
  width: string;
  height: string;
  data: ISankeyData;
  heading?: string | false;
  timestamp?: string | false;
  timerange?: string | false;
  rendered?: (ref: HTMLDivElement) => void;
}

export default function SankeyChart(chart: ISankeyChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;

    chart.rendered(ref.current);

    /**
     * TODO: Exhaustive Deps disabled as we use useEffect as a watcher for "ref" only
     * which is an anti pattern and we need to investigate better solutions
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const layers: SankeyLayerId[] = ["labels", "legends", "nodes", "links"];

  if (includeHeading) {
    // @ts-ignore incomplete typedef by Nivo
    layers.push(() => <text {...exportInfoStyles.heading}>{chart.heading}</text>);
  }
  if (typeof chart.timerange === "string") {
    // @ts-ignore incomplete typedef by Nivo
    layers.push(() => <text {...exportInfoStyles.timerange}>{chart.timerange}</text>);
  }
  if (typeof chart.timestamp === "string") {
    // @ts-ignore incomplete typedef by Nivo
    layers.push(() => <text {...exportInfoStyles.timestamp}>{chart.timestamp}</text>);
  }

  const colors = chart.data.nodes.map((e) => e.nodeColor ?? "green");

  return (
    <div ref={ref} style={{ width: chart.width, height: chart.height }}>
      <ResponsiveSankey
        colors={colors}
        layers={layers}
        margin={{ ...margin }}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderRadius={3}
        nodeBorderColor={{ from: "nodeColor" }}
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
