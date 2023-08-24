import { Heading } from "@chakra-ui/react";
import BarChartVertical from "../../components/graphs/BarChartVertical";

export default function BoxView() {
  const fields = {
    width: 600,
    height: 600,
    colorBar: "#31cab5",
    background: "#ffffff",
    labelX: "Day",
    labelY: "Number of Boxes",
    dataX: [],
    dataY: [],
  };

  return (
    <div>
      <Heading>Box View</Heading>
      <BarChartVertical fields={fields} />
    </div>
  );
}
