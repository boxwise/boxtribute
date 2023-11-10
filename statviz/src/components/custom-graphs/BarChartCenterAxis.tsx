import { useTooltip, Tooltip } from "@visx/tooltip";
import { IXY, labelProps, percent } from "../../utils/chart";
import {
  getMarginTop,
  getScaledExportFields,
  scaledExportFieldsVisX,
  tickProps,
} from "../../utils/theme";
import { tooltipStyles } from "../../utils/theme";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { localPoint } from "@visx/event";
import { isNumber } from "lodash";
import { useEffect, useRef } from "react";

type TooltipData = string;

export interface IBarChartCenterAxis {
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
  visId: string;
  heading?: string;
  timerange?: string;
  timestamp?: string;
  rendered?: () => void;
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
  const ref = useRef(true);

  useEffect(() => {
    const firstRender = ref.current;

    if (firstRender && chart.rendered) {
      chart.rendered();
    }
  });

  const fields = { ...chart };

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
    tooltipLeft: Math.floor(fields.width / 3),
    tooltipTop: Math.floor(fields.height / 3),
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

  const includeHeading = typeof chart.heading === "string";
  const includeTimerange = typeof chart.timerange === "string";
  const marginTop = getMarginTop(
    fields.height,
    fields.width,
    includeHeading,
    includeTimerange
  );

  const exportInfoStyles = getScaledExportFields(
    fields.width,
    fields.height,
    marginTop,
    includeHeading
  );

  const chartWidth = fields.width - (marginLeft + marginRight);
  const chartHeight = fields.height - (marginTop + marginBottom);

  const halfWidth = chartWidth / 2;

  const minX = 0;
  const maxX =
    Math.max(
      ...fields.dataXr.map((e) => e.x),
      ...fields.dataXl.map((e) => e.x)
    ) * 1.05;

  const minY = Math.min(...fields.dataY);
  const maxY = Math.max(...fields.dataY);

  let barHight = chartHeight / fields.dataY.length;
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
    <div id={chart.visId}>
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
          {chart.heading && (
            <text {...exportInfoStyles.heading}>{chart.heading}</text>
          )}
          {chart.timerange && (
            <text {...exportInfoStyles.timerange}>{chart.timerange}</text>
          )}
          {chart.timestamp && (
            <text {...exportInfoStyles.timestamp}>{chart.timestamp}</text>
          )}
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
            {fields.dataXl.map((element) => {
              const yElement = isNumber(element.y) ? element.y : 0;
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXLeft(minX) - barWidth;
              const y = scaleY(yElement);
              const tooltip = `${fields.labelY} ${yElement}, ${fields.labelXl} ${element.x}`;

              return (
                <Bar
                  key={`bar-left-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={y - barHight / 2}
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
                  fill={fields.colorBarLeft}
                />
              );
            })}

            {fields.dataXr.map((element) => {
              const barWidth = halfWidth - scaleXLeft(element.x);
              const x = scaleXRight(minX);
              const y = scaleY(element.y);
              const tooltip = `${fields.labelY} ${element.y}, ${fields.labelXr} ${element.x}`;

              return (
                <Bar
                  key={`bar-right-${element.y}`}
                  width={barWidth}
                  height={barHight}
                  x={x}
                  y={y - barHight / 2}
                  fill={fields.colorBarRight}
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
          <Group top={chartHeight}>
            <AxisBottom
              labelProps={labelProps}
              scale={scaleXLeft}
              hideZero={settings.hideZeroX}
              tickLabelProps={tickProps}
              label={fields.labelXl}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
            <AxisBottom
              labelProps={labelProps}
              scale={scaleXRight}
              hideZero={settings.hideZeroX}
              tickLabelProps={tickProps}
              label={fields.labelXr}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
          </Group>
          <Group>
            <AxisLeft
              scale={scaleY}
              hideZero={settings.hideZeroY}
              labelOffset={30}
              label={fields.labelY}
              labelProps={labelProps}
              strokeWidth={Math.ceil(chartWidth / 750)}
            />
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
    </div>
  );
}
