import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useContext, useMemo } from "react";
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

const UnboxedItemsCollectionList = ({
  unboxedItemsCollectionData,
}: {
  unboxedItemsCollectionData: UnboxedItemsCollectionData[];
}) => (
  <>
    <Heading as="h3" size="md">
      Unboxed Items
    </Heading>
    <Flex direction="column">
      {unboxedItemsCollectionData.map((unboxedItemsCollection, i) => (
        <Flex
          key={i}
          alignItems="center"
          my={2}
          // key={box.labelIdentifier}
          justifyContent="space-between"
        >
          {/* <Text mr={4}>{box.labelIdentifier}</Text> */}
          <Text> # of items: {unboxedItemsCollection.numberOfItems}</Text>
        </Flex>
      ))}
    </Flex>
  </>
);

const BoxesList = ({ boxesData }: { boxesData: BoxData[] }) => {
  const { getBoxDetailViewUrlByLabelIdentifier } =
    useGetUrlForResourceHelpers();

    const ctx = useContext(DistroEventDetailsForPackingStateContext);


    // const [
    //   unassignBoxFromDistributionEventMutation,
    //   unassignBoxFromDistributionEventMutationStatus,
    // ] = useMutation<
    //   UnassignBoxFromDistributionEventMutation,
    //   UnassignBoxFromDistributionEventMutationVariables
    // >(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

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
                    onClick={() => ctx?.onUnassignBoxFromDistributionEvent(box.labelIdentifier)}
                    size="sm"
                    aria-label="Unassign Box from Distribution Event"
                    icon={<CloseIcon />}
                  />
                </Td>
              </Tr>

              // <IconButton
              //   _hover={{
              //     backgroundColor: "transparent",
              //     opacity: "0.5",
              //   }}
              //   backgroundColor="transparent"
              //   aria-label="Delete"
              //   color="teal"
              //   icon={<DeleteIcon />}
              //   onClick={() => {
              //     // packingActionProps.onDeleteBoxFromDistribution(box.id)
              //   }}
              // />
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
          <>
            <Heading as="h3" size="md">
              Packed Boxes and Items for: <br />
              {/* <Heading as="h2" size="lg"> */}
              <i>
                {packingListEntry.product.name} - {packingListEntry.size?.label}
              </i>
              {/* </Heading> */}
            </Heading>
          </>
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
