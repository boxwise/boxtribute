import { VStack, Text, SimpleGrid } from "@chakra-ui/react";
import { useMemo } from "react";
import { subMonths } from "date-fns";
import BoxFlowSankey from "./BoxFlowSankey";
import ShipmentsPieChart from "./ShipmentsPieChart";
import ShipmentsOverTimeChart from "./ShipmentsOverTimeChart";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";
import type { MovementDirection } from "../../../utils/dashboardFilters";

interface IMovedBoxesChartsProps {
  movedBoxes: Partial<MovedBoxes>;
  allMovedBoxesFacts: MovedBoxesResult[];
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
}

export default function MovedBoxesCharts({
  movedBoxes,
  allMovedBoxesFacts,
  boxesOrItems,
  direction,
}: IMovedBoxesChartsProps) {
  const { outgoingCount, incomingCount } = useMemo(() => {
    const cutoff = subMonths(new Date(), 6);
    const targetTypeMap = new Map(
      (movedBoxes?.dimensions?.target ?? [])
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => [t.id, t.type]),
    );
    const targetNameMap = new Map(
      (movedBoxes?.dimensions?.target ?? [])
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => [t.id, t.name]),
    );

    const last6MonthsFacts = allMovedBoxesFacts.filter((f) => new Date(f.movedOn) >= cutoff);

    // OutgoingShipment: a unique (targetId, movedOn) pair — the backend groups facts by
    // (targetId, movedOn, product, gender, ...) so the same destination can appear on
    // multiple send-dates, each representing a distinct shipment.
    // Note: undercounting if multiple shipments are sent on the same day
    // OutgoingLocation: count unique location names instead.
    const outgoingShipmentKeys = new Set(
      last6MonthsFacts
        .filter((f) => targetTypeMap.get(f.targetId) === "OutgoingShipment")
        .map((f) => `${f.targetId}::${f.movedOn}`),
    );
    const outgoingLocationNames = new Set(
      last6MonthsFacts
        .filter((f) => targetTypeMap.get(f.targetId) === "OutgoingLocation")
        .map((f) => targetNameMap.get(f.targetId) ?? f.targetId),
    );
    const incomingShipments = new Set(
      last6MonthsFacts
        .filter((f) => targetTypeMap.get(f.targetId) === "IncomingShipment")
        .map((f) => `${f.targetId}::${f.movedOn}`),
    );

    return {
      outgoingCount: outgoingShipmentKeys.size + outgoingLocationNames.size,
      incomingCount: incomingShipments.size,
    };
  }, [allMovedBoxesFacts, movedBoxes?.dimensions?.target]);

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
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <BoxFlowSankey
          boxesOrItems={boxesOrItems}
          data={movedBoxes}
          width="100%"
          height="533px"
          direction={direction}
        />
        <ShipmentsPieChart
          movedBoxes={movedBoxes}
          boxesOrItems={boxesOrItems}
          direction={direction}
        />
      </SimpleGrid>
      <ShipmentsOverTimeChart
        movedBoxes={movedBoxes}
        boxesOrItems={boxesOrItems}
        direction={direction}
      />
    </VStack>
  );
}
