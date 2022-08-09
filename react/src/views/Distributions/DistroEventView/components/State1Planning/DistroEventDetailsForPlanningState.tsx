import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useEditableControls,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { IPackingListEntry } from "views/Distributions/types";
import _ from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
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
      {/* <Button onClick={() => {entry.numberOfItems = 123}}>Reset</Button> */}
      <Td>{entry.size?.label}</Td>
      <Td>
        <Editable
          // defaultValue={entry.numberOfItems.toString()}
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
  // onRemoveAllPackingListEntriesForProduct: (distributionEventId)
}) => {
  const { productId, productName, gender, packingListEntries } = data;

  const ctx = useContext(DistroEventDetailsForPlanningStateContext);

  const removeAllEntriesForProductAlertState = useDisclosure();
  const cancelRemoveAllEntriesForProductRef = useRef<HTMLButtonElement>(null);

  if (ctx == null) {
    return <></>;
  }

  // const EditableControls = () => {
  //   const {
  //     isEditing,
  //     getSubmitButtonProps,
  //     getCancelButtonProps,
  //     getEditButtonProps,
  //   } = useEditableControls()

  //   return isEditing ? (
  //     <ButtonGroup justifyContent='center' size='sm'>
  //       <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
  //       <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
  //     </ButtonGroup>
  //   ) : (
  //     <Flex justifyContent='center'>
  //       <IconButton size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
  //     </Flex>
  //   )
  // }

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
  // const packingListEntriesGroupedByProduct = _.groupBy(packingListEntries, (entry) => ({productId: entry.product.id, productName: entry.product.name}));
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
        gender: product.gender,
        // category: product.
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

      {/* {packingListEntries.map((item) => {
        return (
          <SimpleGrid
            // minChildWidth={300}
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
            <Box>{item.product.gender}</Box>
            <Box>
              <IconButton
                background="transparent"
                onClick={() => onEditItemOnPackingListClick(item.id)}
                aria-label="Edit Packing List Item"
              >
                <EditIcon mx={2} color="teal" />
              </IconButton>
              <IconButton
                background="transparent"
                onClick={() => onRemoveItemFromPackingListClick(item.id)}
                aria-label="Remove Packing List Item"
              >
                <CloseIcon color="teal" />
              </IconButton>
            </Box>
          </SimpleGrid>
        );
      })} */}
    </>
  );
};

export default DistroEventDetailsForPlanningState;
