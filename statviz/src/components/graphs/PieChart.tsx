import { useTooltip, Tooltip } from "@visx/tooltip";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import { Pie } from "@visx/shape";
import { tooltipStyles } from "../../utils/chart";
import localPoint from "@visx/event/lib/localPointGeneric";

type TooltipData = string;

export interface Data {
  label: string;
  value: number;
}

export interface IPieChart {
  fields: {
    width: number;
    height: number;
    background: string;
    data: Data[];
  };
}

export default function PieChart(chart: IPieChart) {
  const fields = { ...chart.fields };

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    // initial tooltip state
    tooltipOpen: false,
    tooltipLeft: fields.width / 3,
    tooltipTop: fields.height / 3,
    tooltipData: "",
  });

  let tooltipTimeout: number;

  const values = fields.data.map((point) => point.value);
  const labels = fields.data.map((point) => point.label);

  const sum = values.reduce((a, b) => a + b);

  const percentages = fields.data.map((point) => (point.value * 100) / sum);

  const accessor = (d: Data) => d.value;

  const getColors = scaleOrdinal({
    domain: labels,
    range: ["#ffec21", "#378aff", "#ffa32f", "#f54f52", "#93f03b", "#9552ea"],
  });

  const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

  return (
    <>
      <h1>Pie Chart</h1>
      <svg
        width={fields.width}
        height={fields.height}
        style={{ fontFamily: "Open Sans" }}
      >
        <Group top={220} left={220}>
          <Pie
            data={fields.data}
            pieValue={accessor}
            outerRadius={200}
            cornerRadius={2}
            padAngle={0.004}
            fill={(arc) => getColors(arc.data.label)}
            centroid={(centroid, arc) => {
              const [x, y] = centroid;
              return (
                <text
                  x={x}
                  y={y - 15}
                  fill="white"
                  textAnchor="middle"
                  dy=".33em"
                  fontSize={14}
                >
                  <tspan x={x} dy="1.2em">
                    {arc.data.label}
                  </tspan>
                  <tspan x={x} dy="1.2em">
                    {arc.data.value}
                  </tspan>
                </text>
              );
            }}
            onMouseLeave={() => {
              tooltipTimeout = window.setTimeout(() => hideTooltip(), 300);
            }}
            onMouseMove={(data) => (event) => {
              console.log(data);
              console.log(event);
              // if (tooltipTimeout) clearTimeout(tooltipTimeout);
              // const localY = localPoint(event)?.y ?? 0;
              // showTooltip({
              //  tooltipData: tooltip,
              // tooltipTop: localY - fields.height,
              //  tooltipLeft: localPoint(event)?.x,
              //});
            }}
          />
        </Group>
      </svg>
      <div style={{ position: "relative" }}>
        {tooltipOpen && tooltipData && (
          <Tooltip
            key={Math.random()}
            left={tooltipLeft}
            top={tooltipTop}
            style={tooltipStyles}
          >
            <span>{tooltipData}</span>
          </Tooltip>
        )}
      </div>
    </>
  );
}
