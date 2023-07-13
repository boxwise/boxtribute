import { Box, Flex } from "@chakra-ui/react";
import { IDropdownOption } from "components/Form/SelectField";
import {
  BoxByLabelIdentifierQuery,
  BoxState,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import BoxCard from "./BoxCard";
import BoxDistributionEvent from "./BoxDistributionEvent";
import BoxTabs from "./BoxTabs";

interface IBoxDetailsProps {
  boxData: BoxByLabelIdentifierQuery["box"] | UpdateLocationOfBoxMutation["updateBox"];
  boxInTransit: boolean;
  onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onStateChange: (boxState: BoxState) => void;
  onAssignBoxToDistributionEventClick: (distributionEventId: string) => void;
  onUnassignBoxFromDistributionEventClick: (distributionEventId: string) => void;
  onAssignBoxesToShipment: (shipmentId: string) => void;
  onUnassignBoxesToShipment: (shipmentId: string) => void;
  shipmentOptions: IDropdownOption[];
  isLoading: boolean;
}

function BoxDetails({
  boxData,
  boxInTransit,
  onMoveToLocationClick,
  onAssignBoxToDistributionEventClick,
  onUnassignBoxFromDistributionEventClick,
  onPlusOpen,
  onMinusOpen,
  onStateChange,
  onAssignBoxesToShipment,
  onUnassignBoxesToShipment,
  shipmentOptions,
  isLoading,
}: IBoxDetailsProps) {
  if (boxData == null) {
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Flex
      direction={["column", "column", "row"]}
      alignItems={["center", "center", "flex-start"]}
      w="100%"
      justifyContent="center"
      data-testid="box-sections"
    >
      <BoxCard
        boxData={boxData}
        boxInTransit={boxInTransit}
        onMinusOpen={onMinusOpen}
        onPlusOpen={onPlusOpen}
        onStateChange={onStateChange}
        isLoading={isLoading}
      />
      <BoxTabs
        boxData={boxData}
        boxInTransit={boxInTransit}
        onMoveToLocationClick={onMoveToLocationClick}
        onAssignBoxesToShipment={onAssignBoxesToShipment}
        onUnassignBoxesToShipment={onUnassignBoxesToShipment}
        shipmentOptions={shipmentOptions}
        isLoading={isLoading}
      />
      {boxData.distributionEvent && (
        <BoxDistributionEvent
          boxData={boxData}
          onUnassignBoxFromDistributionEventClick={onUnassignBoxFromDistributionEventClick}
          onAssignBoxToDistributionEventClick={onAssignBoxToDistributionEventClick}
        />
      )}
    </Flex>
  );
}

export default BoxDetails;
