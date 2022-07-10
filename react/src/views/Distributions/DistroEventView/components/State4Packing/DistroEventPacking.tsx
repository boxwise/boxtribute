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
import FirstOverlay from "./Overlays/FirstOverlay";
import SecondOverlay, {
  BoxData,
  PackingActionProps,
} from "./Overlays/SecondOverlay";
import { useState } from "react";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import { DistributionEventState } from "types/generated/graphql";

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
  boxData: BoxData;
  packingActionProps: PackingActionProps;
}

const DistroEventPacking = ({
  distroEventDetailsData,
  onShowListClick,
  boxData,
  packingActionProps,
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
                        justifyItems="center"
                        // py={2}
                        borderTop="1px"
                        borderColor="gray.300"
                        direction="row"
                      >
                        <Box
                          backgroundColor="transparent"
                          borderRadius="0px"
                          flex="1"
                          textAlign="center"
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
                            onClick={() => onShowListClick(item.id)}
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
      <FirstOverlay
        modalProps={{
          isFirstOpen,
          onFirstClose,
          onSecondOpen,
          onFirstOpen,
        }}
      />
      <SecondOverlay
        modalProps={{ isSecondOpen, onSecondClose }}
        boxData={boxData}
        packingActionProps={packingActionProps}
        itemsForPackingNumberOfItems={chosenPackingNumberOfItems}
        stateProps={{
          isMovingItems,
          setIsMovingItems,
        }}
      />
    </>
  );
};
export default DistroEventPacking;
