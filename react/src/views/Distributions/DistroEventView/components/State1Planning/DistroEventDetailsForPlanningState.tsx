import { Box, Button, Flex, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import { IPackingListEntry } from "views/Distributions/types";

interface DistroEventDetailsForPlanningStateProps {
  packingListEntries: IPackingListEntry[];
  onAddItemsClick: () => void;
  onCopyPackingListFromPreviousEventsClick: () => void;
  onEditItemOnPackingListClick: (packlistItemId: string) => void;
  onRemoveItemFromPackingListClick: (packlistItemId: string) => void;
}

const DistroEventDetailsForPlanningState = ({
  packingListEntries,
  onAddItemsClick,
  onCopyPackingListFromPreviousEventsClick,
  onRemoveItemFromPackingListClick,
  onEditItemOnPackingListClick,
}: DistroEventDetailsForPlanningStateProps) => {
  return (
    <>
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
        <Button my={2} onClick={() => onAddItemsClick()}>
          Add New Items
        </Button>
        <Button onClick={() => onCopyPackingListFromPreviousEventsClick()}>
          Copy Packing List from Previous Event
        </Button>
      </Flex>
      <Text fontSize="md">
        <strong>Packing List:</strong>
      </Text>
      {packingListEntries.map((item) => {
        return (
          <SimpleGrid
            minChildWidth="10px"
            py={2}
            columns={6}
            borderBottom="1px"
            borderColor="gray.300"
            my={2}
            key={item.id}
          >
            <Box>{item.numberOfItems}</Box>
            <Box>{item.product.name}</Box>
            <Box>{item.size?.label}</Box>
            <Box>{item.gender}</Box>
            <Box>
              <IconButton background="transparent" onClick={() => onEditItemOnPackingListClick(item.id)} aria-label="Edit Packing List Item">
                <EditIcon mx={2} color="teal" />
              </IconButton>
              <IconButton background="transparent" onClick={() => onRemoveItemFromPackingListClick(item.id)} aria-label="Remove Packing List Item">
                <CloseIcon color="teal" />
              </IconButton>
            </Box>
          </SimpleGrid>
        );
      })}
    </>
  );
};

export default DistroEventDetailsForPlanningState;
