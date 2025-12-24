import { useTooltip, Tooltip } from "@visx/tooltip";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { localPoint } from "@visx/event";
import { isNumber } from "lodash";
import { useEffect, useRef } from "react";
import {
  tooltipStyles,
  getMarginTop,
  getScaledExportFields,
  tickProps,
} from "../../../utils/theme";
import { IXY, labelProps } from "../../utils/chart";

type TooltipData = string;

export interface IBarChartCenterAxis {
  width: string | number;
  height: string | number;
  labelY: string;
  labelXr: string;
  labelXl: string;
  dataY: Array<number>;
  dataXr: Array<IXY>;
  dataXl: Array<IXY>;
  background: string;
  colorBarLeft: string;
  colorBarRight: string;
  visId: string;
  heading?: string;
  timerange?: string;
  timestamp?: string;
  rendered?: (ref: HTMLDivElement) => void;
  settings?: {
    hideZeroY?: boolean;
    hideZeroX?: boolean;
  };
}

const defaultSettings = {
  hideZeroY: false,
  hideZeroX: false,
};

const marginLeft = 70;
const marginRight = 40;
const marginBottom = 70;

export default function BarChartCenterAxis(chart: IBarChartCenterAxis) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstRender = ref.current;

    if (firstRender && chart.rendered) {
      chart.rendered(firstRender);
    }
  });

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
  });

  const tooltipTimeout = useRef<number | null>(null);

  const settings = {
    ...defaultSettings,
    ...chart.settings,
  };

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";
  const width = typeof chart.width === "number" ? chart.width : parseInt(chart.width, 10);
  const height = typeof chart.height === "number" ? chart.height : parseInt(chart.height, 10);
  const marginTop = getMarginTop(height, width, includeHeading, includeTimerange);

  const exportInfoStyles = getScaledExportFields(width, height, marginTop, includeHeading);

  const chartWidth = width - (marginLeft + marginRight);
  const chartHeight = height - (marginTop + marginBottom);

  const halfWidth = chartWidth / 2;

  const minX = 0;
  const maxX = Math.max(...chart.dataXr.map((e) => e.x), ...chart.dataXl.map((e) => e.x)) * 1.05;

  const maxY = Math.max(...chart.dataY);

  let barHight = chartHeight / chart.dataY.length;
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
    domain: [maxY + 2, -1],
    range: [0, chartHeight],
    nice: false,
    round: true,
  });

  return (
    <div ref={ref} id={chart.visId}>
      <svg width={width} height={height} style={{ fontFamily: "Open Sans" }}>
        <rect fill={chart.background} width={width} height={height} />
        <Group top={marginTop} left={marginLeft}>
          {chart.heading && <text {...exportInfoStyles.heading}>{chart.heading}</text>}
          {chart.timerange && <text {...exportInfoStyles.timerange}>{chart.timerange}</text>}
          {chart.timestamp && <text {...exportInfoStyles.timestamp}>{chart.timestamp}</text>}
          <Group>
            <Grid
              width={chartWidth / 2}
              height={chartHeight}
              strokeWidth={Math.ceil(chartWidth / 750)}
              xScale={scaleXLeft}
              yScale={scaleY}
            />
            <Grid
              left={chartWidth / 2}
              width={chartWidth / 2}
              height={chartHeight}
              strokeWidth={Math.ceil(chartWidth / 750)}
              xScale={scaleXLeft}
              yScale={scaleY}
            />
          </Group>
          <Group>
            {chart.dataXl.map((element) => {
              const yElement = isNumber(element.y) ? element.y : 0;
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXLeft(minX) - barWidth;
              const y = scaleY(yElement);
              const tooltip = `${chart.labelY} ${yElement}, ${chart.labelXl} ${element.x}`;

              return (
                <Bar
                  key={`bar-left-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={Math.round(y - barHight / 2)}
                  onMouseLeave={() => {
                    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                    tooltipTimeout.current = window.setTimeout(() => hideTooltip(), 300);
                  }}
                  onMouseMove={(event) => {
                    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                    const localY = localPoint(event)?.y ?? 0;
                    showTooltip({
                      tooltipData: tooltip,
                      tooltipTop: localY - height,
                      tooltipLeft: localPoint(event)?.x,
                    });
                  }}
                  fill={chart.colorBarLeft}
                />
              );
            })}

            {chart.dataXr.map((element) => {
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXRight(minX);
              const y = scaleY(element.y);
              const tooltip = `${chart.labelY} ${element.y}, ${chart.labelXr} ${element.x}`;

              return (
                <Bar
                  key={`bar-right-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={Math.round(y - barHight / 2)}
                  fill={chart.colorBarRight}
                  onMouseLeave={() => {
                    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                    tooltipTimeout.current = window.setTimeout(() => hideTooltip(), 300);
                  }}
                  onMouseMove={(event) => {
                    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
                    const localY = localPoint(event)?.y ?? 0;

                    showTooltip({
                      tooltipData: tooltip,
                      tooltipTop: localY - height,
                      tooltipLeft: localPoint(event)?.x ?? 0,
                    });
                  }}
                />
              );
            })}
          </Group>
          <Group top={chartHeight}>
            <AxisBottom
              labelProps={labelProps}
              scale={scaleXLeft}
              hideZero={settings.hideZeroX}
              tickLabelProps={tickProps}
              label={chart.labelXl}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
            <AxisBottom
              labelProps={labelProps}
              scale={scaleXRight}
              hideZero={settings.hideZeroX}
              tickLabelProps={tickProps}
              label={chart.labelXr}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
          </Group>
          <Group>
            <AxisLeft
              scale={scaleY}
              hideZero={settings.hideZeroY}
              labelOffset={30}
              label={chart.labelY}
              labelProps={labelProps}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
          </Group>
        </Group>
      </svg>
      <div style={{ position: "relative" }}>
        {tooltipOpen && tooltipData && (
          <Tooltip
            id="chart-tooltip"
            key="1"
            left={tooltipLeft}
            top={tooltipTop}
            style={tooltipStyles}
          >
            {tooltipData}
          </Tooltip>
        )}
      </div>
    </div>
  );
}
