import { Box, Button, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { CloseIcon, EditIcon } from '@chakra-ui/icons'
import { DistributionEventState, ProductGender } from "types/generated/graphql";
import { DistroEventStateLabel } from "views/Distributions/DistroSpotsView/components/DistroSpots";

export interface DistroEvent {
  eventDate?: Date;
  distroSpot: string;
  status: DistributionEventState;
  itemsForPacking: PackingListEntry[];
}

export interface PackingListEntry {
  id: string;
  productName: string;
  size?: string;
  gender?: ProductGender;
  items: number;
}

export interface DistroEventDetailsData {
    distroEventData: DistroEvent;
}

interface DistroEventDetailsProps {
  distroEventDetailsData: DistroEventDetailsData
  onAddItemsClick: () => void;
  onCopyPackingListFromPreviousEventsClick: () => void;
  onEditItemOnPackingListClick: (packlistItemId: string) => void;
  onRemoveItemFromPackingListClick: (packlistItemId: string) => void;
}

const DistroEventDetails = ({
  distroEventDetailsData,
  onAddItemsClick,
  onCopyPackingListFromPreviousEventsClick,
  onRemoveItemFromPackingListClick,
  onEditItemOnPackingListClick,
}: DistroEventDetailsProps ) => {
  return (
    <>
      <Box>
        <Text fontSize="xl">{distroEventDetailsData.distroEventData.distroSpot}</Text>
        <Text fontSize="xl" mb={2} borderBottom="1px" borderColor="gray.300">{distroEventDetailsData.distroEventData.eventDate?.toDateString()}</Text>
        <Text>
          <strong>{DistroEventStateLabel.get(distroEventDetailsData.distroEventData.status)}</strong>
        </Text>
      </Box>
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
      <Button my={2} onClick={() => onAddItemsClick()}>Add New Items</Button>
      <Button onClick={() => onCopyPackingListFromPreviousEventsClick()}>
        Copy Packing List from Previous Event
      </Button>
      </Flex>
      <Text fontSize="md"><strong>Packing List:</strong></Text>
      {distroEventDetailsData.distroEventData.itemsForPacking.map((item) => {
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

export default DistroEventDetails;
