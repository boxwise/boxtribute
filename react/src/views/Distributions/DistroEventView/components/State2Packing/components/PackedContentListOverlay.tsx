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
} from "@chakra-ui/react";
import { BoxData, UnboxedItemsCollectionData } from "views/Distributions/types";

export interface PackingActionListProps {
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

interface PackedContentListOverlayProps {
  boxesData: BoxData[];
  unboxedItemCollectionData?: UnboxedItemsCollectionData;
}

const PackedContentListOverlay = ({
  boxesData,
  unboxedItemCollectionData
}: // packingActionProps,
PackedContentListOverlayProps) => {
  return (
    <>
      <ModalContent>
        <ModalHeader mx={4} pb={0}>
          Packed Boxes and Items
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody mx={4}>
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
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </>
  );
};

export default PackedContentListOverlay;
