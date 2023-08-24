import { Heading } from "@chakra-ui/react";
import BarChartVertical from "../../components/graphs/BarChartVertical";
import _ from "lodash";

export default function BoxView() {
  const randomData = [];
  for (let i = 1; i < 20; i++) {
    randomData.push({ x: `${i}.1.2023`, y: _.random(5, 20) });
  }

  console.log(randomData);

  const fields = {
    width: 800,
    height: 600,
    colorBar: "#31cab5",
    background: "#ffffff",
    labelX: "Day",
    labelY: "Number of Boxes",
    data: randomData,
    settings: {
      yEndMargin: 2,
    },
  };

  return (
    <div>
      <Heading>Box View</Heading>
      <BarChartVertical fields={fields} />
    </div>
  );
}
