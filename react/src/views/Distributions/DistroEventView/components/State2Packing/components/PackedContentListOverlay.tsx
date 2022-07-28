import { DeleteIcon } from "@chakra-ui/icons";
import {
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Text,
  IconButton,
  Box,
  Heading,
} from "@chakra-ui/react";
import {
  BoxData,
  IPackingListEntry,
  UnboxedItemsCollectionData,
} from "views/Distributions/types";

export interface PackingActionListProps {
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

interface PackedContentListOverlayProps {
  boxesData: BoxData[];
  unboxedItemCollectionData: UnboxedItemsCollectionData[];
  packingListEntry: IPackingListEntry;
}

const UnboxedItemsCollectionList = ({
  unboxedItemCollectionData,
}: {
  unboxedItemCollectionData: UnboxedItemsCollectionData[];
}) => (
  <>
    <Heading as="h3" size="md">
      Unboxed Items
    </Heading>
    <Flex direction="column">
      {unboxedItemCollectionData.map((unboxedItemsCollection, i) => (
        <Flex
          key={i}
          alignItems="center"
          borderBottom="1px"
          borderColor="gray.300"
          my={2}
          // key={box.labelIdentifier}
          justifyContent="space-between"
        >
          <Flex direction="row">
            {/* <Text mr={4}>{box.labelIdentifier}</Text> */}
            <Text>
              {" "}
              number of items: {unboxedItemsCollection.numberOfItems}
            </Text>
          </Flex>
          <Box>
            <IconButton
              _hover={{
                backgroundColor: "transparent",
                opacity: "0.5",
              }}
              backgroundColor="transparent"
              aria-label="Delete"
              color="teal"
              icon={<DeleteIcon />}
              onClick={() => {
                // packingActionProps.onDeleteBoxFromDistribution(box.id)
              }}
            />
          </Box>
        </Flex>
      ))}
    </Flex>
  </>
);

const BoxesList = ({ boxesData }: { boxesData: BoxData[] }) => (
  <>
    <Heading as="h3" size="md">
      Boxes
    </Heading>
    <Flex direction="column">
      {boxesData.map((box) => (
        <Flex
          alignItems="center"
          borderBottom="1px"
          borderColor="gray.300"
          my={2}
          key={box.labelIdentifier}
          justifyContent="space-between"
        >
          <Flex direction="row">
            <Text mr={4}>{box.labelIdentifier}</Text>
            <Text> number of items: {box.numberOfItems}</Text>
          </Flex>
          <Box>
            <IconButton
              _hover={{
                backgroundColor: "transparent",
                opacity: "0.5",
              }}
              backgroundColor="transparent"
              aria-label="Delete"
              color="teal"
              icon={<DeleteIcon />}
              onClick={() => {
                // packingActionProps.onDeleteBoxFromDistribution(box.id)
              }}
            />
          </Box>
        </Flex>
      ))}
    </Flex>
  </>
);

const PackedContentListOverlay = ({
  boxesData,
  unboxedItemCollectionData,
  packingListEntry,
}: // packingActionProps,
PackedContentListOverlayProps) => {
  return (
    <>
      <ModalContent>
        <ModalHeader mx={4} pb={0}>
          <>
            <Heading as="h3" size="md">
              Packed Boxes and Items for{" "}: <br />
            {/* <Heading as="h2" size="lg"> */}
              <i>{packingListEntry.product.name} - {packingListEntry.size?.label}</i>
            {/* </Heading> */}
            </Heading>
          </>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody mx={4}>
          {boxesData.length > 0 && <BoxesList boxesData={boxesData} />}
          {unboxedItemCollectionData.length > 0 && (
            <UnboxedItemsCollectionList
              unboxedItemCollectionData={unboxedItemCollectionData}
            />
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </>
  );
};

export default PackedContentListOverlay;
