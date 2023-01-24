import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  BoxData,
  IPackingListEntry,
  UnboxedItemsCollectionData,
} from "views/Distributions/types";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import { DistroEventDetailsForPackingStateContext } from "../DistroEventDetailsForPackingStateContainer";

export interface PackingActionListProps {
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

interface PackedContentListOverlayProps {
  boxesData: BoxData[];
  unboxedItemsCollectionData: UnboxedItemsCollectionData[];
  packingListEntry: IPackingListEntry;
}

const UnboxedItemsCollectionListEntry = ({
  unboxedItemsCollection,
}: {
  unboxedItemsCollection: UnboxedItemsCollectionData;
}) => {
  const removeUnboxedItemsOverlayState = useDisclosure();
  const [numberOfItemsToRemove, setNumberOfItemsToRemove] = useState<
    number | undefined
  >();

  const ctx = useContext(DistroEventDetailsForPackingStateContext);

  useEffect(() => {
    setNumberOfItemsToRemove(undefined);
  }, [removeUnboxedItemsOverlayState.isOpen]);

  return (
    <>
      <Modal
        isOpen={removeUnboxedItemsOverlayState.isOpen}
        onClose={removeUnboxedItemsOverlayState.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader mx={4} pb={0}>
            <>
              <Heading as="h3" size="md">
                Remove items
              </Heading>
            </>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody mx={4}>
            <Flex
              direction="column"
              alignItems="start"
              my={2}
              justifyContent="space-between"
            >
              <FormControl display="flex" alignItems="center">
                <FormLabel fontSize="sm" htmlFor="numberOfItems">
                  # of items:
                </FormLabel>
                <Input
                  type="number"
                  width={20}
                  name="numberOfItems"
                  onChange={(ev) =>
                    setNumberOfItemsToRemove(parseInt(ev.target.value))
                  }
                  value={numberOfItemsToRemove}
                ></Input>
              </FormControl>
              <Button
                onClick={() => {
                  ctx?.onRemoveUnboxedItems(
                    unboxedItemsCollection.id,
                    numberOfItemsToRemove!
                  );
                  removeUnboxedItemsOverlayState.onClose();
                }}
                disabled={
                  numberOfItemsToRemove == null || numberOfItemsToRemove < 1
                }
              >
                Remove
              </Button>
            </Flex>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>

      <Flex alignItems="start" my={2} justifyContent="space-between">
        <Text> # of items: {unboxedItemsCollection.numberOfItems}</Text>
        <Button onClick={removeUnboxedItemsOverlayState.onOpen}>
          Remove items
        </Button>
      </Flex>
    </>
  );
};

const UnboxedItemsCollectionList = ({
  unboxedItemsCollectionData,
  productId,
  sizeId,
}: {
  unboxedItemsCollectionData: UnboxedItemsCollectionData[];
  productId: string;
  sizeId: string;
}) => {
  return (
    <>
      <Heading as="h3" size="md">
        Unboxed Items
      </Heading>
      <Flex direction="column">
        {unboxedItemsCollectionData.map((unboxedItemsCollection) => (
          <UnboxedItemsCollectionListEntry
            key={unboxedItemsCollection.id}
            unboxedItemsCollection={unboxedItemsCollection}
          />
        ))}
      </Flex>
    </>
  );
};

const BoxesList = ({ boxesData }: { boxesData: BoxData[] }) => {
  const { getBoxDetailViewUrlByLabelIdentifier } =
    useGetUrlForResourceHelpers();

  const ctx = useContext(DistroEventDetailsForPackingStateContext);

  return (
    <>
      <Heading as="h3" size="md">
        Boxes
      </Heading>
      <TableContainer mt={3}>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Box Label</Th>
              <Th isNumeric># of items</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {boxesData.map((box) => (
              <Tr key={box.labelIdentifier}>
                <Td>
                  <RouterLink
                    to={getBoxDetailViewUrlByLabelIdentifier(
                      box.labelIdentifier
                    )}
                  >
                    {box.labelIdentifier}
                  </RouterLink>
                </Td>
                <Td isNumeric>{box.numberOfItems}</Td>
                <Td>
                  <IconButton
                    onClick={() =>
                      ctx?.onUnassignBoxFromDistributionEvent(
                        box.labelIdentifier
                      )
                    }
                    size="sm"
                    aria-label="Unassign Box from Distribution Event"
                    icon={<CloseIcon />}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

const PackedContentListOverlay = ({
  boxesData,
  unboxedItemsCollectionData,
  packingListEntry,
}: // packingActionProps,
PackedContentListOverlayProps) => {
  const totalNumberOfPackedItems = useMemo(
    () =>
      boxesData.reduce((acc, box) => acc + box.numberOfItems, 0) +
      unboxedItemsCollectionData.reduce(
        (acc, unboxedItemsCollection) =>
          acc + unboxedItemsCollection.numberOfItems,
        0
      ),
    [boxesData, unboxedItemsCollectionData]
  );

  const missingNumberOfItems = useMemo(
    () => packingListEntry.numberOfItems - totalNumberOfPackedItems,
    [packingListEntry.numberOfItems, totalNumberOfPackedItems]
  );
  return (
    <>
      <ModalContent>
        <ModalHeader mx={4} pb={0}>
          <Heading as="h3" size="md">
            Packed Boxes and Items for: <br />
            <i>
              {packingListEntry.product.name} - {packingListEntry.size?.label}
            </i>
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody mx={4}>
          {boxesData.length > 0 && (
            <Box my={5}>
              <BoxesList boxesData={boxesData} />
            </Box>
          )}
          {unboxedItemsCollectionData.length > 0 && (
            <Box my={5}>
              <UnboxedItemsCollectionList
                unboxedItemsCollectionData={unboxedItemsCollectionData}
                productId={packingListEntry.product.id}
                // TODO: check/align why size.id is nullable atm
                // assumption so far: each box / unboxed items collection needs
                // a sizeId
                sizeId={packingListEntry.size?.id!}
              />
            </Box>
          )}

          <StatGroup my={5}>
            <Stat>
              <StatLabel>Packed # of items</StatLabel>
              <StatNumber>{totalNumberOfPackedItems}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Target # of items</StatLabel>
              <StatNumber>{packingListEntry.numberOfItems}</StatNumber>
            </Stat>
          </StatGroup>

          {missingNumberOfItems <= 0 && (
            <Badge colorScheme="green">
              {/* <CheckIcon /> Target number ({packingListEntry.numberOfItems}) fullfilled (with {totalNumberOfPackedItems} items) */}
              <CheckIcon /> Enough items packed
            </Badge>
          )}
          {missingNumberOfItems > 0 && (
            <Badge colorScheme="red">
              {missingNumberOfItems} items missing
            </Badge>
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </>
  );
};

export default PackedContentListOverlay;
