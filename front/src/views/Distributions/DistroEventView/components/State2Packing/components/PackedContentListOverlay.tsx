import { IoCheckmark, IoClose } from "react-icons/io5";
import {
  Badge,
  Box,
  Button,
  Flex,
  Field,
  Heading,
  IconButton,
  Input,
  DialogRoot,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogBackdrop,
  Stat,
  StatGroup,
  StatLabel,
  Table,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { BoxData, IPackingListEntry, UnboxedItemsCollectionData } from "views/Distributions/types";
import { useGetUrlForResourceHelpers } from "hooks/hooks";
import { DistroEventDetailsForPackingStateContext } from "../DistroEventDetailsForPackingStateContainer";

export interface PackingActionListProps {
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

interface PackedContentListOverlayProps {
  boxesData: BoxData[];
  unboxedItemsCollectionData: UnboxedItemsCollectionData[];
  packingListEntry: IPackingListEntry;
}

function UnboxedItemsCollectionListEntry({
  unboxedItemsCollection,
}: {
  unboxedItemsCollection: UnboxedItemsCollectionData;
}) {
  const removeUnboxedItemsOverlayState = useDisclosure();
  const [numberOfItemsToRemove, setNumberOfItemsToRemove] = useState<number | undefined>();

  const ctx = useContext(DistroEventDetailsForPackingStateContext);

  useEffect(() => {
    setNumberOfItemsToRemove(undefined);
  }, [removeUnboxedItemsOverlayState.open]);

  return (
    <>
      <DialogRoot
        open={removeUnboxedItemsOverlayState.open}
        onOpenChange={(e) => !e.open && removeUnboxedItemsOverlayState.onClose()}
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader mx={4} pb={0}>
            <>
              <Heading as="h3" size="md">
                Remove items
              </Heading>
            </>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody mx={4}>
            <Flex direction="column" alignItems="start" my={2} justifyContent="space-between">
              <Field.Root display="flex" alignItems="center">
                <Field.Label fontSize="sm" htmlFor="numberOfItems">
                  # of items:
                </Field.Label>
                <Input
                  type="number"
                  width={20}
                  name="numberOfItems"
                  onChange={(ev) => setNumberOfItemsToRemove(parseInt(ev.target.value))}
                  value={numberOfItemsToRemove}
                />
              </Field.Root>
              <Button
                onClick={() => {
                  ctx?.onRemoveUnboxedItems(unboxedItemsCollection.id, numberOfItemsToRemove!);
                  removeUnboxedItemsOverlayState.onClose();
                }}
                disabled={numberOfItemsToRemove == null || numberOfItemsToRemove < 1}
              >
                Remove
              </Button>
            </Flex>
          </DialogBody>
          <DialogFooter />
        </DialogContent>
      </DialogRoot>

      <Flex alignItems="start" my={2} justifyContent="space-between">
        <Text> # of items: {unboxedItemsCollection.numberOfItems}</Text>
        <Button onClick={removeUnboxedItemsOverlayState.onOpen}>Remove items</Button>
      </Flex>
    </>
  );
}

function UnboxedItemsCollectionList({
  unboxedItemsCollectionData,
}: {
  unboxedItemsCollectionData: UnboxedItemsCollectionData[];
  productId: string;
  sizeId: string;
}) {
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
}

function BoxesList({ boxesData }: { boxesData: BoxData[] }) {
  const { getBoxDetailViewUrlByLabelIdentifier } = useGetUrlForResourceHelpers();

  const ctx = useContext(DistroEventDetailsForPackingStateContext);

  return (
    <>
      <Heading as="h3" size="md">
        Boxes
      </Heading>
      <Table.Root size="sm" mt={3}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Box Label</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end"># of items</Table.ColumnHeader>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {boxesData.map((box) => (
            <Table.Row key={box.labelIdentifier}>
              <Table.Cell>
                <RouterLink to={getBoxDetailViewUrlByLabelIdentifier(box.labelIdentifier)}>
                  {box.labelIdentifier}
                </RouterLink>
              </Table.Cell>
              <Table.Cell textAlign="end">{box.numberOfItems}</Table.Cell>
              <Table.Cell>
                <IconButton
                  onClick={() => ctx?.onUnassignBoxFromDistributionEvent(box.labelIdentifier)}
                  size="sm"
                  aria-label="Unassign Box from Distribution Event"
                >
                  <IoClose />
                </IconButton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

function PackedContentListOverlay({
  boxesData,
  unboxedItemsCollectionData,
  packingListEntry,
}: // packingActionProps,
PackedContentListOverlayProps) {
  const totalNumberOfPackedItems = useMemo(
    () =>
      boxesData.reduce((acc, box) => acc + box.numberOfItems, 0) +
      unboxedItemsCollectionData.reduce(
        (acc, unboxedItemsCollection) => acc + unboxedItemsCollection.numberOfItems,
        0,
      ),
    [boxesData, unboxedItemsCollectionData],
  );

  const missingNumberOfItems = useMemo(
    () => packingListEntry.numberOfItems - totalNumberOfPackedItems,
    [packingListEntry.numberOfItems, totalNumberOfPackedItems],
  );
  return (
    <DialogContent>
      <DialogHeader mx={4} pb={0}>
        <Heading as="h3" size="md">
          Packed Boxes and Items for: <br />
          <i>
            {packingListEntry.product.name} - {packingListEntry.size?.label}
          </i>
        </Heading>
      </DialogHeader>
      <DialogCloseTrigger />
      <DialogBody mx={4}>
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
          <Stat.Root>
            <StatLabel>Packed # of items</StatLabel>
            <Stat.ValueText>{totalNumberOfPackedItems}</Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <StatLabel>Target # of items</StatLabel>
            <Stat.ValueText>{packingListEntry.numberOfItems}</Stat.ValueText>
          </Stat.Root>
        </StatGroup>

        {missingNumberOfItems <= 0 && (
          <Badge colorPalette="green">
            {/* <CheckIcon /> Target number ({packingListEntry.numberOfItems}) fullfilled (with {totalNumberOfPackedItems} items) */}
            <IoCheckmark /> Enough items packed
          </Badge>
        )}
        {missingNumberOfItems > 0 && (
          <Badge colorPalette="red">{missingNumberOfItems} items missing</Badge>
        )}
      </DialogBody>
      <DialogFooter />
    </DialogContent>
  );
}

export default PackedContentListOverlay;
