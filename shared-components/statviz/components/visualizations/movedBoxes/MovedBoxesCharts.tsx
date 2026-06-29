import { VStack, Wrap, WrapItem, Text } from "@chakra-ui/react";
import { useMemo } from "react";
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
  const { outgoingCount, incomingCount } = useMemo(() => {
    const targets = movedBoxes?.dimensions?.target ?? [];
    const outgoing = targets.filter((t) => t.type === "OutgoingShipment").length;
    const incoming = targets.filter((t) => t.type === "IncomingShipment").length;
    return { outgoingCount: outgoing, incomingCount: incoming };
  }, [movedBoxes?.dimensions?.target]);

  return (
    <VStack align="stretch" spacing={6}>
      <Text fontWeight="bold" color="gray.500">
        In the last{" "}
        <Text fontWeight="bold" as="span" color="black">
          6 months
        </Text>
        , you had{" "}
        <Text fontWeight="bold" as="span" color="black">
          {outgoingCount}
        </Text>{" "}
        outgoing {outgoingCount === 1 ? "shipment" : "shipments"}, and{" "}
        <Text fontWeight="bold" as="span" color="black">
          {incomingCount}
        </Text>{" "}
        incoming {incomingCount === 1 ? "shipment" : "shipments"}.
      </Text>
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
