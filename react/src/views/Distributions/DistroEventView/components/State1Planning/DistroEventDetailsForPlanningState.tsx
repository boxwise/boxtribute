import { Box, Button, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { CloseIcon, EditIcon } from '@chakra-ui/icons'
import { ProductGender } from "types/generated/graphql";
import { DistributionEventDetails } from "views/Distributions/types";

// export interface DistroEventDetailsForPlanningState extends {
//   eventDate?: Date;
//   distroSpotName: string;
//   status: DistributionEventState;
//   itemsForPacking: PackingListEntry[];
// }

export interface PackingListEntry {
  id: string;
  productName: string;
  size?: string;
  gender?: ProductGender;
  items: number;
}

export interface DistroEventDetailsDataForPlanningState {
    distroEventData: DistributionEventDetails;
    itemsForPacking: PackingListEntry[];
    // DistributionEventDetails
}

interface DistroEventDetailsForPlanningStateProps {
  distroEventDetailsData: DistroEventDetailsDataForPlanningState
  onAddItemsClick: () => void;
  onCopyPackingListFromPreviousEventsClick: () => void;
  onEditItemOnPackingListClick: (packlistItemId: string) => void;
  onRemoveItemFromPackingListClick: (packlistItemId: string) => void;
}

const DistroEventDetailsForPlanningState = ({
  distroEventDetailsData,
  onAddItemsClick,
  onCopyPackingListFromPreviousEventsClick,
  onRemoveItemFromPackingListClick,
  onEditItemOnPackingListClick,
}: DistroEventDetailsForPlanningStateProps ) => {
  return (
    <>
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
      <Button my={2} onClick={() => onAddItemsClick()}>Add New Items</Button>
      <Button onClick={() => onCopyPackingListFromPreviousEventsClick()}>
        Copy Packing List from Previous Event
      </Button>
      </Flex>
      <Text fontSize="md"><strong>Packing List:</strong></Text>
      {distroEventDetailsData.itemsForPacking.map((item) => {
        return (
          <SimpleGrid
            minChildWidth="10px"
            py={2}
            columns={6}
            borderBottom="1px"
            borderColor="gray.300"
            my={2}
          >
            <Box>{item.items}</Box>
            <Box>{item.productName}</Box>
            <Box>{item.size}</Box>
            <Box>{item.gender}</Box>
            <Box>
            <EditIcon onClick={() => onEditItemOnPackingListClick(item.id)} mx={2} color="teal"/>
            <CloseIcon onClick={() => onRemoveItemFromPackingListClick(item.id)} color="teal"/></Box>

          </SimpleGrid>
        );
      })}
    </>
  );
};

export default DistroEventDetailsForPlanningState;
