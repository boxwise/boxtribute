import { Grid } from "@visx/grid";
import { labelProps, tickProps, tooltipStyles } from "../../utils/chart";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand } from "d3-scale";
import { Bar } from "@visx/shape";
import { useTooltip, Tooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";

type TooltipData = string;

const marginTop = 20;
const marginLeft = 70;
const marginRight = 40;
const marginBottom = 80;

const defaultSettings = {
  yEndMargin: 0,
  hideZeroY: true,
  hideZeroX: false,
  startWithZero: true,
};

export interface IBarChartVertical {
  fields: {
    width: number;
    height: number;
    background: string;
    colorBar: string;
    labelX: string;
    labelY: string;
    data: Array<{ x: string; y: number }>;
    settings?: {
      yEndMargin?: number;
      startWithZero?: boolean;
      hideZeroY?: boolean;
      hideZeroX?: boolean;
    };
  };
}

export default function BarChartVertical(chart: IBarChartVertical) {
  const fields = chart.fields;

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

  if (!fields.settings) {
    fields.settings = {};
  }
  const settings = {
    ...defaultSettings,
    ...fields.settings,
  };

  const chartWidth = fields.width - (marginLeft + marginRight);
  const chartHeight = fields.height - (marginTop + marginBottom);

  const y = fields.data.map((e) => e.y);
  const x = fields.data.map((e) => e.x);

  let yMin = 0;
  if (!settings.startWithZero) {
    yMin = Math.min(...y);
  }
  const yMax = Math.max(...y) + settings.yEndMargin;

  const scaleX = scaleBand<string>(x, [0, chartWidth]).padding(0.4);

  const scaleY = scaleLinear<number>({
    domain: [yMax, yMin],
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
              label={fields.labelX}
              tickLabelProps={tickProps}
              hideZero={settings.hideZeroX}
            />
            <AxisLeft
              labelProps={labelProps}
              scale={scaleY}
              tickLabelProps={tickProps}
              label={fields.labelY}
              hideZero={settings.hideZeroY}
            />
          </Group>
          <Group>
            {x.map((xValue, index) => {
              const barWidth = scaleX.bandwidth();
              const barHeight = chartHeight - scaleY(y[index]);
              const barX = scaleX(xValue);
              const barY = chartHeight - barHeight;
              const tooltip = `${fields.labelY} ${y[index]} ${fields.labelX} ${xValue}`;

              return (
                <Bar
                  key={`bar-${xValue}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={fields.colorBar}
                  onMouseLeave={() => {
                    tooltipTimeout = window.setTimeout(
                      () => hideTooltip(),
                      300
                    );
                  }}
                  onMouseMove={(event) => {
                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    const localY = localPoint(event)?.y ?? 0;
                    showTooltip({
                      tooltipData: tooltip,
                      tooltipTop: localY - fields.height,
                      tooltipLeft: localPoint(event)?.x,
                    });
                  }}
                />
              );
            })}
          </Group>
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
