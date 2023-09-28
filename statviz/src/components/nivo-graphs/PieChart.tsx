import { ResponsivePie } from "@nivo/pie";

export interface PieChart {
  width: string;
  height: string;
  data: Array<object>;
}

export default function PieChart(chart: PieChart) {
  return (
    <div style={{ width: chart.width, height: chart.height }}>
      <ResponsivePie
        data={chart.data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        borderWidth={1}
        arcLabel="label"
        isInteractive={true}
        activeOuterRadiusOffset={2}
      />
    </div>
  );
}
