import { Button } from "@chakra-ui/react";
import { ResponsiveSunburst } from "@nivo/sunburst";
import { useState } from "react";

export interface ISunburstData {
  name: string;
  color?: string;
  value?: string;
  children?: ISunburstData[];
}

export default function Sunburst(props: {
  width: string;
  height: string;
  chartData: ISunburstData;
}) {
  const [data, setData] = useState(props.chartData);

  return (
    <div style={{ width: props.width, height: props.height }}>
      <Button onClick={() => setData(props.chartData)} borderRadius="0px" border="2px">
        Reset
      </Button>
      <ResponsiveSunburst
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        id="id"
        value="value"
        // @ts-ignore Nivo return type definition incomplete
        tooltip={(e) => {
          if (e.data.value) {
            return `${e.data.name} ${e.data.value}`;
          }
          return `${e.data.name} ${e.value}`;
        }}
        animate
        motionConfig="gentle"
        transitionMode="pushIn"
        onClick={(clickedData) => {
          if (clickedData.data.children) {
            setData(clickedData.data);
          }
        }}
        cornerRadius={2}
        borderColor={{ theme: "background" }}
        colors={{ scheme: "nivo" }}
        childColor={{
          from: "color",
          modifiers: [["brighter", 0.1]],
        }}
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 1.4]],
        }}
      />
      a
    </div>
  );
}
