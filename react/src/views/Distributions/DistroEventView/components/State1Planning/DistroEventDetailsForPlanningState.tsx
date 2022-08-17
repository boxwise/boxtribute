import { CloseIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button, Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading, IconButton, Table, TableContainer,
  Tbody,
  Td,
  Text, Th,
  Thead,
  Tr,
  useDisclosure
} from "@chakra-ui/react";
import _ from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import { ProductGender } from "types/generated/graphql";
import { IPackingListEntry } from "views/Distributions/types";
import { DistroEventDetailsForPlanningStateContext } from "./DistroEventDetailsForPlanningStateContainer";

interface IPackingListEntrieGroupForProduct {
  productId: string;
  productName: string;
  gender?: string;
  // category: string;
  packingListEntries: IPackingListEntry[];
}

type OnUpdatePackingListEntry = (
  packingListEntryId: string,
  numberOfItems: number
) => void;

interface PackingListEntryTableRowProps {
  entry: IPackingListEntry;
  onUpdatePackingListEntry: OnUpdatePackingListEntry;
}

const PackingListEntryTableRow = ({
  entry,
  onUpdatePackingListEntry,
}: PackingListEntryTableRowProps) => {
  const onChangeHandlerForEntry = (newVal: string) => {
    const newAmount = parseInt(newVal, 10);
    if (entry.numberOfItems === newAmount) {
      return;
    } else {
      onUpdatePackingListEntry(entry.id, newAmount);
    }
  };

  const [numberOfItemsFormValue, setNumberOfItemsFormValue] = useState(
    entry.numberOfItems
  );

  useEffect(() => {
    setNumberOfItemsFormValue(entry.numberOfItems);
  }, [entry]);

  return (
    <Tr key={entry.id}>
      <Td>{entry.size?.label}</Td>
      <Td>
        <Editable
          value={numberOfItemsFormValue.toString()}
          onChange={(newVal) => setNumberOfItemsFormValue(parseInt(newVal))}
          onSubmit={onChangeHandlerForEntry}
        >
          <EditablePreview width={20} />
          <EditableInput width={20} type="number" />
        </Editable>
      </Td>
    </Tr>
  );
};

const PackingListEntriesGroupForProduct = ({
  data,
  onUpdatePackingListEntry,
}: {
  data: IPackingListEntrieGroupForProduct;
  onUpdatePackingListEntry: OnUpdatePackingListEntry;
}) => {
  const { productId, productName, gender, packingListEntries } = data;

  const ctx = useContext(DistroEventDetailsForPlanningStateContext);

  const removeAllEntriesForProductAlertState = useDisclosure();
  const cancelRemoveAllEntriesForProductRef = useRef<HTMLButtonElement>(null);

  if (ctx == null) {
    return <></>;
  }

  return (
    <>
      <Box pb={30}>
        <Flex backgroundColor={"gray.50"} justifyContent={"space-around"}>
          <Heading as="h3" size="sm" py={3}>
            {productName} ({gender})
          </Heading>
          <IconButton
            backgroundColor="transparent"
            icon={<CloseIcon />}
            aria-label="Remove Product from Packing List"
            onClick={() => removeAllEntriesForProductAlertState.onOpen()}
          />
        </Flex>

        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Size</Th>
                <Th>No. of items</Th>
              </Tr>
            </Thead>
            <Tbody>
              {packingListEntries.map((entry) => (
                <PackingListEntryTableRow
                  key={entry.id}
                  entry={entry}
                  onUpdatePackingListEntry={onUpdatePackingListEntry}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <AlertDialog
        isOpen={removeAllEntriesForProductAlertState.isOpen}
        leastDestructiveRef={cancelRemoveAllEntriesForProductRef}
        onClose={removeAllEntriesForProductAlertState.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete all packing list entries for this product?
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRemoveAllEntriesForProductRef}
                onClick={removeAllEntriesForProductAlertState.onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() =>
                  ctx.onRemoveAllPackingListEntriesForProduct(productId)
                }
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

interface DistroEventDetailsForPlanningStateProps {
  packingListEntries: IPackingListEntry[];
  onAddItemsClick: () => void;
  onCopyPackingListFromPreviousEventsClick: () => void;
  onRemoveItemFromPackingListClick: (packlistItemId: string) => void;
  onUpdatePackingListEntry: OnUpdatePackingListEntry;
}

const DistroEventDetailsForPlanningState = ({
  onUpdatePackingListEntry,
  packingListEntries,
  onAddItemsClick,
  onCopyPackingListFromPreviousEventsClick,
  onRemoveItemFromPackingListClick,
}: DistroEventDetailsForPlanningStateProps) => {
  const packingListEntriesGroupedByProductId = _.groupBy(
    packingListEntries,
    (entry) => entry.product.id
  );
  const packingListEntriesGroupedByProductIdAndName: IPackingListEntrieGroupForProduct[] =
    Object.keys(packingListEntriesGroupedByProductId).map((k) => {
      const product = packingListEntriesGroupedByProductId[k]?.[0]?.product;
      return {
        productId: k,
        productName: product?.name,
        gender: (product.gender != null && ProductGender[product.gender]) || "",
        packingListEntries: packingListEntriesGroupedByProductId[k],
      };
    });

  return (
    <>
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
        <Button onClick={() => onCopyPackingListFromPreviousEventsClick()}>
          Copy Packing List from Previous Event
        </Button>
        <Button my={2} onClick={() => onAddItemsClick()} colorScheme="blue">
          Select Products for Packing List
        </Button>
      </Flex>
      <Heading size={"md"}>Packing List</Heading>

      {packingListEntriesGroupedByProductIdAndName.map(
        (packingListEntrieGroupForProduct) => (
          <PackingListEntriesGroupForProduct
            key={packingListEntrieGroupForProduct.productId}
            data={packingListEntrieGroupForProduct}
            onUpdatePackingListEntry={onUpdatePackingListEntry}
          />
        )
      )}
      {packingListEntriesGroupedByProductIdAndName.length === 0 && (
        <Text>You don't have any entries on your packing list yet.</Text>
      )}
    </>
  );
};

export default DistroEventDetailsForPlanningState;
