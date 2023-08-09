import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";

const data = {
  labelLeft: "Women",
  labelRight: "Men",
  labelY: "Age",
  labelX: "Count",
  dataLeftX: [10, 40],
  dataLeftY: [5, 10],
  dataRightX: [50, 100],
  dataRightY: [20, 40],
};

const maxXLeft = Math.max(...data.dataLeftX);
const maxXRight = Math.max(...data.dataRightX);

const maxX = Math.max(...data.dataRightX, ...data.dataLeftX);
const maxY = Math.max(...data.dataLeftY, ...data.dataRightY);

const minX = Math.min(...data.dataRightX, ...data.dataLeftX);
const minY = Math.min(...data.dataLeftY, ...data.dataRightY) - 5;

const bottomAxisColor = "#141414";
const background = "#dbdbdb";

const width = 800;
const height = 600;

const marginTop = 20;
const marginLeft = 20;

export default function BarChartCenterAxisTest() {
  const scaleLeft = scaleLinear({
    domain: [maxX, minX],
    range: [0, width / 2],
    round: true,
  });
  const scaleRight = scaleLinear({
    domain: [minX, maxX],
    range: [width / 2 - marginLeft, width - marginLeft * 2],
    round: true,
  });
  const scaleCenter = scaleLinear({
    domain: [minY, maxY],
    range: [height - marginTop * 3, 0],
    round: true,
  });

  return (
    <>
      <p>Bar chart center axis</p>
      <svg width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} rx={5} />
        <Group top={marginTop} left={marginLeft}>
          <Group>
            {data.dataLeftX.map((xValue, index) => {
              const test = "";
              const barWidth = width - 40 - scaleLeft(xValue);
              const barY = scaleCenter(data.dataLeftY[index]);
              return <Bar y={barY - 5} x={0} width={barWidth} height={10} fill="#e95165" />;
            })}
          </Group>
          <Group>
            {data.dataRightX.map((xValue, index) => {
              const test = "";
              const barWidth = width - 40 - scaleRight(xValue);
              const barY = scaleCenter(data.dataRightY[index]);
              return (
                <Bar
                  y={barY - 5}
                  x={width / 2 - marginLeft / 2}
                  width={barWidth}
                  height={10}
                  fill="#2eceb5"
                />
              );
            })}
          </Group>
          <AxisRight
            left={width / 2 - marginLeft / 2}
            scale={scaleCenter}
            hideZero
            numTicks={50}
            tickLabelProps={{
              fontSize: 14,
            }}
          />
          <AxisLeft
            left={width / 2 - marginLeft / 2}
            numTicks={50}
            scale={scaleCenter}
            tickLabelProps={{
              fontSize: 14,
            }}
            hideZero
          />
          <Group top={height - marginTop * 3}>
            <AxisBottom
              hideZero
              scale={scaleLeft}
              stroke={bottomAxisColor}
              strokeWidth={2}
              tickLabelProps={{
                fontSize: 14,
              }}
            />
            <AxisBottom
              hideZero
              scale={scaleRight}
              stroke={bottomAxisColor}
              strokeWidth={2}
              tickLabelProps={{
                fontSize: 14,
              }}
            />
          </Group>
        </Group>
      </svg>
    </>
  );
}
