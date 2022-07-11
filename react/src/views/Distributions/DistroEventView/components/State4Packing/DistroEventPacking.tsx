import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text,
  Box,
  Flex,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import PackingScanOverlay from "./Overlays/PackingScanOverlay";
import PackingBoxDetailsOverlay, {
  BoxData,
  PackingActionProps,
} from "./Overlays/PackingBoxDetailsOverlay";
import { useState } from "react";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import { DistributionEventState } from "types/generated/graphql";
import PackedListOverlay, { PackingActionListProps } from "./Overlays/PackedListOverlay";

interface ItemsForPacking {
  id: string;
  numberOfItems: number;
  size: string;
  productName: string;
}

interface DistroEventData {
  eventDate: Date;
  distroSpotName: string;
  status: DistributionEventState;
  itemsForPacking: ItemsForPacking[]
}


export interface DistroEventPackingData {
  distroEventData: DistroEventData;
}

interface DistroEventPackingProps {
  distroEventDetailsData: DistroEventPackingData;
  onShowListClick: (itemId: string) => void;
  boxData: BoxData[];
  packingActionProps: PackingActionProps;
  packingActionListProps: PackingActionListProps;
}

const DistroEventPacking = ({
  distroEventDetailsData,
  onShowListClick,
  boxData,
  packingActionProps,
  packingActionListProps,
}: DistroEventPackingProps) => {

  const itemsForPackingGroupedByProductName = groupBy(
    distroEventDetailsData.distroEventData.itemsForPacking,
    (item) => item.productName
  );

  //TO DO Sort the sizes by size order
  const itemsForPackingSorted = Object.keys(
    itemsForPackingGroupedByProductName
  ).map((key) => {
    return {
      productName: key,
      items: itemsForPackingGroupedByProductName[key].map((item) => ({
        numberOfItems: item.numberOfItems,
        size: item.size,
        id: item.id,
        productName: item.productName,
      })),
    };
  });

  const {
    isOpen: isFirstOpen,
    onClose: onFirstClose,
    onOpen: onFirstOpen,
  } = useDisclosure();
  const {
    isOpen: isSecondOpen,
    onClose: onSecondClose,
    onOpen: onSecondOpen,
  } = useDisclosure();
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();

  const [chosenPackingNumberOfItems, setChosenPackingItemId] = useState(0);
  const [isMovingItems, setIsMovingItems] = useState(false);

  return (
    <>
      <Box textAlign="left">
        <Flex direction="column" mb={4}>
          <Text fontSize="xl" mb={1}>
            Distro Event
          </Text>
          <Text lineHeight="normal">
            <strong>{distroEventDetailsData.distroEventData.distroSpotName}</strong>
          </Text>
          <Text lineHeight="normal">
            <strong>
              {distroEventDetailsData.distroEventData.eventDate?.toDateString()}
            </strong>
          </Text>
          <Text>
            {distroEventStateHumanReadableLabels.get(
              distroEventDetailsData.distroEventData.status
            )}
          </Text>
        </Flex>
        <Accordion w={[300, 420, 500]} allowToggle>
          {itemsForPackingSorted.map((item) => {
            return (
              <AccordionItem w={[300, 420, 500]} justifyItems="center">
                <Flex justifyItems="center">
                  <AccordionButton zIndex="2">
                    <Box flex="1" textAlign="center">
                      <strong>{item.productName}</strong>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Flex>
                {item.items.map((item) => {
                  return (
                    <AccordionPanel py={0}>
                      <Flex
                        // alignContent="center"
                        alignItems="center"
                        justifyItems="space-between"
                        // py={2}
                        borderTop="1px"
                        borderColor="gray.300"
                        direction="row"
                        >
                        <Box
                          backgroundColor="transparent"
                          borderRadius="0px"
                          flex="1"
                          textAlign="left"
                        >
                          {item.numberOfItems} x {item.size}
                        </Box>
                        <Box>
                          <IconButton
                            _hover={{
                              backgroundColor: "transparent",
                              opacity: "0.5",
                            }}
                            backgroundColor="transparent"
                            aria-label="Add items"
                            icon={<AddIcon />}
                            onClick={(e) => {
                              onFirstOpen();
                              setChosenPackingItemId(item.numberOfItems);
                            }}
                            color="teal"
                          />
                          <IconButton
                            _hover={{
                              backgroundColor: "transparent",
                              opacity: "0.5",
                            }}
                            backgroundColor="transparent"
                            aria-label="Show list of packed items"
                            icon={<ExternalLinkIcon />}
                            onClick={(e) => {
                              onListOpen();
                              onShowListClick(item.id);
                            }}
                            color="teal"
                          />
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  );
                })}
              </AccordionItem>
            );
          }, [])}
        </Accordion>
      </Box>
      <PackingScanOverlay
        modalProps={{
          isFirstOpen,
          onFirstClose,
          onSecondOpen,
        }}
      />
      <PackingBoxDetailsOverlay
        modalProps={{ isSecondOpen, onSecondClose }}
        boxData={boxData}
        packingActionProps={packingActionProps}
        itemsForPackingNumberOfItems={chosenPackingNumberOfItems}
        stateProps={{
          isMovingItems,
          setIsMovingItems,
        }}
      />
      <PackedListOverlay
        modalProps={{ isListOpen, onListClose }}
        boxData={boxData}
        packingActionProps={packingActionListProps}
      />
    </>
  );
};
export default DistroEventPacking;
