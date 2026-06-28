import { VStack, Wrap, WrapItem } from "@chakra-ui/react";
import BoxFlowSankey from "./BoxFlowSankey";
import ShipmentsPieChart from "./ShipmentsPieChart";
import ShipmentsOverTimeChart from "./ShipmentsOverTimeChart";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import { MovedBoxes } from "../../../../../graphql/types";
import type { MovementDirection } from "../../../utils/dashboardFilters";

interface IMovedBoxesChartsProps {
  movedBoxes: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
}

export default function MovedBoxesCharts({
  movedBoxes,
  boxesOrItems,
  direction,
}: IMovedBoxesChartsProps) {
  return (
    <VStack align="stretch" spacing={6}>
      <Wrap gap={6}>
        <WrapItem overflow="auto" padding="5px">
          <BoxFlowSankey
            boxesOrItems={boxesOrItems}
            data={movedBoxes}
            width="1000px"
            height="600px"
            direction={direction}
          />
        </WrapItem>
        <WrapItem overflow="auto" padding="5px">
          <ShipmentsPieChart
            movedBoxes={movedBoxes}
            boxesOrItems={boxesOrItems}
            direction={direction}
          />
        </WrapItem>
      </Wrap>
      <ShipmentsOverTimeChart
        movedBoxes={movedBoxes}
        boxesOrItems={boxesOrItems}
        direction={direction}
      />
    </VStack>
  );
}
