import { Box, Button, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { DistroEvent } from "./../../CreateDistroEventDataView/components/CreateDistroEventDate";
import { BTBox } from "./../../DistroEventView/components/DistroEvent";
import { CloseIcon, EditIcon } from '@chakra-ui/icons'

export interface DistroEventDetailsData {
    itemsForPacking: BTBox[];
    distroEventDateAndLoc: DistroEvent; 
}

interface DistroEventDetailsProps {
  distroEventDetailsData: DistroEventDetailsData
  onAddItemsClick: () => void;
  onCopyPackingListFromPreviousEventsClick: () => void;
  onEditClick: () => void;
  onCloseClick: () => void;
}

const DistroEventDetails = ({
  distroEventDetailsData,
  onAddItemsClick,
  onCopyPackingListFromPreviousEventsClick,
  onCloseClick,
  onEditClick,
}: DistroEventDetailsProps ) => {
  return (
    <>
      <Box>
        <Text fontSize="xl">{distroEventDetailsData.distroEventDateAndLoc.distroSpot}</Text>
        <Text fontSize="xl" mb={2} borderBottom="1px" borderColor="gray.300">{distroEventDetailsData.distroEventDateAndLoc.eventDate?.toDateString()}</Text>
      </Box>
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
            <Box>{item.name}</Box>
            <Box>{item.size}</Box>
            <Box>{item.gender}</Box>
            <Box>
            <EditIcon onClick={() => onEditClick()} mx={2} color="teal"/>
            <CloseIcon onClick={() => onCloseClick()} color="teal"/></Box>
            
          </SimpleGrid>
        );
      })}
    </>
  );
};

export default DistroEventDetails;
