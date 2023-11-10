import { ResponsiveSankey } from "@nivo/sankey";
import { scaledNivoTheme } from "../../utils/theme";

export interface SankeyChart {
  width: string;
  height: string;
  data: object;
}

export default function SankeyChart(chart: SankeyChart) {
  const width = parseInt(chart.width);
  const height = parseInt(chart.height);
  console.log(chart.data);

  return (
    <div style={{ width: chart.width, height: chart.height }}>
      <ResponsiveSankey
        colors={{ scheme: "category10" }}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
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
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1]],
        }}
        data={chart.data}
      />
    </div>
  );
}
