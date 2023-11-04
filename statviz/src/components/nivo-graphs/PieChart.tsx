import { ResponsivePie } from "@nivo/pie";

export interface PieChart {
  width: string;
  height: string;
  data: Array<object>;
}

export default function PieChart(chart: PieChart) {
  const arcLabel = (d) => {
    if (d.id.length > 20) {
      const cuttedString = d.id.split("").splice(0, 20).join("");
      return `${cuttedString}...`;
    }
    return d.id;
  };

  return (
    <div style={{ width: chart.width, height: chart.height }}>
      <ResponsivePie
        data={chart.data}
        margin={{ top: 40, right: 150, bottom: 80, left: 150 }}
        borderWidth={1}
        arcLabel="label"
        isInteractive={true}
        activeOuterRadiusOffset={2}
        arcLinkLabel={arcLabel}
        arcLinkLabelsDiagonalLength={10}
        arcLinkLabelsStraightLength={16}
      />
    </div>
  );
}
