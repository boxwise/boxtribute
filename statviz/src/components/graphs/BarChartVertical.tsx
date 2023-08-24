import { Grid } from "@visx/grid";
import { IXY, tooltipStyles, labelProps } from "../../utils/chart";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";

const marginTop = 10;
const marginLeft = 70;
const marginRight = 40;
const marginBottom = 70;

const defaultSettings = {
  hideZeroY: false,
  hideZeroX: false,
};

export interface IBarChartVertical {
  fields: {
    width: number;
    height: number;
    background: string;
    colorBar: string;
    labelX: string;
    labelY: string;
    dataX: Array<IXY>;
    dataY: Array<IXY>;
    settings?: {
      hideZeroY?: boolean;
      hideZeroX?: boolean;
    };
  };
}

export default function BarChartVertical(chart: IBarChartVertical) {
  const fields = chart.fields;

  if (!fields.settings) {
    fields.settings = {};
  }
  const settings = {
    ...defaultSettings,
    ...fields.settings,
  };

  const chartWidth = fields.width - (marginLeft + marginRight);
  const chartHeight = fields.height - (marginTop + marginBottom);

  const barWidth = 15;

  const scaleX = scaleLinear({
    domain: [0, 100],
    range: [0, chartWidth],
  });

  const scaleY = scaleLinear({
    domain: [100, 0],
    range: [0, chartHeight],
  });

  return (
    <>
      <svg
        width={fields.width}
        height={fields.height}
        style={{ fontFamily: "Open Sans" }}
      >
        <rect
          fill={fields.background}
          width={fields.width}
          height={fields.height}
        />
        <Group top={marginTop} left={marginLeft}>
          <Grid
            width={chartWidth}
            height={chartHeight}
            xScale={scaleX}
            yScale={scaleY}
          />
          <Group>
            <AxisBottom
              top={chartHeight}
              labelProps={labelProps}
              scale={scaleX}
            />
            <AxisLeft labelProps={labelProps} scale={scaleY} />
          </Group>
        </Group>
      </svg>
      <div>Tooltip Div</div>
    </>
  );
}
