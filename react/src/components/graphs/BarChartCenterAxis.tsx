import { AxisBottom, AxisLeft } from "@visx/axis";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Bar } from "@visx/shape";

export interface IXY {
  x: number;
  y: number;
}

export interface IBarChartCenterAxis {
  fields: {
    labelY: string;
    labelXr: string;
    labelXl: string;
    dataY: Array<number>;
    dataXr: Array<IXY>;
    dataXl: Array<IXY>;
    width: number;
    height: number;
    background: string;
    colorBarLeft: string;
    colorBarRight: string;
  };
}

const marginTop = 20;
const marginLeft = 40;
const marginRight = 40;
const marginBottom = 40;

export default function BarChartCenterAxis(chart: IBarChartCenterAxis) {
  const fields = { ...chart.fields };

  const chartWidth = fields.width - (marginLeft + marginRight);
  const chartHight = fields.height - (marginTop + marginBottom);

  const halfWidth = chartWidth / 2;

  const minX = 0; // Math.min(...fields.dataXr.map((e) => e.x), ...fields.dataXl.map((e) => e.x))
  const maxX = Math.max(...fields.dataXr.map((e) => e.x), ...fields.dataXl.map((e) => e.x)) * 1.05;

  const minY = Math.min(...fields.dataY) - 1;
  const maxY = Math.max(...fields.dataY);

  let barHight = chartHight / fields.dataY.length;
  if (barHight > 10) {
    barHight *= 0.7;
  } else {
    barHight *= 0.6;
  }

  const scaleXLeft = scaleLinear({
    domain: [minX, maxX],
    range: [halfWidth, 0],
    round: true,
    nice: true,
  });

  const scaleXRight = scaleLinear({
    domain: [minX, maxX],
    range: [halfWidth, chartWidth],
    nice: true,
    round: true,
  });

  const scaleY = scaleLinear({
    domain: [minY, maxY],
    range: [chartHight, marginTop],
    nice: true,
    round: true,
  });

  return (
    <>
      <p>BarChartCenterAxis test 2</p>
      <svg width={fields.width} height={fields.height}>
        <rect fill={fields.background} width={fields.width} height={fields.height} />
        <Group top={marginTop} left={marginLeft}>
          <Group top={chartHight}>
            <AxisBottom scale={scaleXLeft} />
            <AxisBottom scale={scaleXRight} />
          </Group>
          <Group>
            <AxisLeft scale={scaleY} />
          </Group>
          <Group>
            <Grid width={chartWidth / 2} height={chartHight} xScale={scaleXLeft} yScale={scaleY} />
            <Grid
              left={chartWidth / 2}
              width={chartWidth / 2}
              height={chartHight}
              xScale={scaleXLeft}
              yScale={scaleY}
            />
          </Group>
          <Group>
            {fields.dataXl.map((element, index) => {
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXLeft(minX) - barWidth;
              const y = scaleY(element.y);

              return (
                <Bar
                  key={`bar-left-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={y - barHight / 2}
                  fill={fields.colorBarLeft}
                />
              );
            })}

            {fields.dataXr.map((element, index) => {
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXRight(minX);
              const y = scaleY(element.y);

              return (
                <Bar
                  key={`bar-right-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={y - barHight / 2}
                  fill={fields.colorBarRight}
                />
              );
            })}
          </Group>
        </Group>
      </svg>
    </>
  );
}
