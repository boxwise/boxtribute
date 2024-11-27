import { Box, Stack } from "@chakra-ui/react";
import { IDropdownOption } from "components/Form/SelectField";
import BoxCard from "./BoxCard";
import BoxDistributionEvent from "./BoxDistributionEvent";
import BoxTabs from "./BoxTabs";
import { BoxState } from "../../../../../graphql/types";
import { BoxByLabelIdentifier, UpdateBoxMutation } from "queries/types";

interface IBoxDetailsProps {
  /** @todo Should this be optional peer the test spec? */
  boxData?: BoxByLabelIdentifier | UpdateBoxMutation;
  boxInTransit: boolean;
  onMoveToLocationClick: (locationId: string) => void;
  onHistoryOpen: () => void;
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
  onHistoryOpen,
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
    <Stack
      direction={["column", "column", "row"]}
      alignSelf="center"
      alignItems={["center", "center", "flex-start"]}
      spacing={[6, 6, 16]}
      w={["100%", "80%", "100%", "80%"]}
      justifyContent="center"
      data-testid="box-sections"
    >
      <BoxCard
        boxData={boxData!}
        boxInTransit={boxInTransit}
        onHistoryOpen={onHistoryOpen}
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
    </Stack>
  );
}

export default BoxDetails;
