import { IoClose } from "react-icons/io5";
import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Editable,
  Flex,
  Heading,
  IconButton,
  Table,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import _ from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import { IPackingListEntry } from "views/Distributions/types";
import { DistroEventDetailsForPlanningStateContext } from "./DistroEventDetailsForPlanningStateContainer";

interface IPackingListEntrieGroupForProduct {
  productId: string;
  productName: string;
  gender?: string;
  // category: string;
  packingListEntries: IPackingListEntry[];
}

type OnUpdatePackingListEntry = (packingListEntryId: string, numberOfItems: number) => void;

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

  const [numberOfItemsFormValue, setNumberOfItemsFormValue] = useState(entry.numberOfItems);

  const { numberOfItems } = entry;
  useEffect(() => {
    setNumberOfItemsFormValue(numberOfItems);
  }, [numberOfItems]);

  const backgroundColor = entry.numberOfItems > 0 ? "blue.50" : "transparent";

  return (
    <Table.Row key={entry.id} backgroundColor={backgroundColor}>
      <Table.Cell>{entry.size?.label}</Table.Cell>
      <Table.Cell>
        <Editable.Root
          backgroundColor={entry.numberOfItems > 0 ? "organe.100" : "transparent"}
          value={numberOfItemsFormValue.toString()}
          onValueChange={(e) => setNumberOfItemsFormValue(parseInt(e.value))}
          onValueCommit={(e) => onChangeHandlerForEntry(e.value)}
        >
          <Editable.Preview width={20} />
          <Editable.Input width={20} type="number" />
        </Editable.Root>
      </Table.Cell>
    </Table.Row>
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
            aria-label="Remove Product from Packing List"
            onClick={() => removeAllEntriesForProductAlertState.onOpen()}
          >
            <IoClose />
          </IconButton>
        </Flex>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Size</Table.ColumnHeader>
              <Table.ColumnHeader>No. of items</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {packingListEntries.map((entry) => (
              <PackingListEntryTableRow
                key={entry.id}
                entry={entry}
                onUpdatePackingListEntry={onUpdatePackingListEntry}
              />
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <DialogRoot
        open={removeAllEntriesForProductAlertState.open}
        onOpenChange={(e) => {
          if (!e.open) {
            removeAllEntriesForProductAlertState.onClose();
          }
        }}
        initialFocusEl={() => cancelRemoveAllEntriesForProductRef.current}
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader fontSize="lg" fontWeight="bold">
            Delete all packing list entries for this product?
          </DialogHeader>

          <DialogBody>Are you sure?</DialogBody>

          <DialogFooter>
            <Button
              ref={cancelRemoveAllEntriesForProductRef}
              onClick={removeAllEntriesForProductAlertState.onClose}
            >
              Cancel
            </Button>
            <Button
              colorPalette="red"
              onClick={() => ctx.onRemoveAllPackingListEntriesForProduct(productId)}
              ml={3}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
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
}: DistroEventDetailsForPlanningStateProps) => {
  const packingListEntriesGroupedByProductId = _.groupBy(
    packingListEntries,
    (entry) => entry.product.id,
  );
  const packingListEntriesGroupedByProductIdAndName: IPackingListEntrieGroupForProduct[] =
    Object.keys(packingListEntriesGroupedByProductId).map((k) => {
      const product = packingListEntriesGroupedByProductId[k]?.[0]?.product;
      return {
        productId: k,
        productName: product?.name,
        gender: (product.gender != null && product.gender) || "",
        packingListEntries: packingListEntriesGroupedByProductId[k],
      };
    });

  return (
    <>
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
        <Button onClick={() => onCopyPackingListFromPreviousEventsClick()}>
          Copy Packing List from Previous Event
        </Button>
        <Button my={2} onClick={() => onAddItemsClick()} colorPalette="blue">
          Select Products for Packing List
        </Button>
      </Flex>
      <Heading size={"md"}>Packing List</Heading>

      {packingListEntriesGroupedByProductIdAndName.map((packingListEntrieGroupForProduct) => (
        <PackingListEntriesGroupForProduct
          key={packingListEntrieGroupForProduct.productId}
          data={packingListEntrieGroupForProduct}
          onUpdatePackingListEntry={onUpdatePackingListEntry}
        />
      ))}
      {packingListEntriesGroupedByProductIdAndName.length === 0 && (
        <Text>You don&apos;t have any entries on your packing list yet.</Text>
      )}
    </>
  );
};

export default DistroEventDetailsForPlanningState;
