import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text,
  Box,
  // Checkbox,
  Flex,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { groupBy } from "utils/helpers";
import { DistroEventStateLabel } from "views/Distributions/DistroSpotsView/components/DistroSpots";
import FirstOverlay from "./Overlays/FirstOverlay";
import SecondOverlay, {
  BoxData,
  PackingActionProps,
} from "./Overlays/SecondOverlay";
import { useState } from "react";

export interface DistroEventPackingData {
  distroEventData: DistroEvent;
}

interface DistroEventPackingProps {
  distroEventDetailsData: DistroEventPackingData;
  onCheckboxClick: () => void;
  boxData: BoxData;
  packingActionProps: PackingActionProps;
}

const DistroEventPacking = ({
  distroEventDetailsData,
  // onCheckboxClick,
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
        gender: item.gender,
        id: item.id,
        productName: item.productName
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
    isOpen: isThirdOpen,
    onClose: onThirdClose,
    onOpen: onThirdOpen,
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
            <strong>{distroEventDetailsData.distroEventData.distroSpot}</strong>
          </Text>
          <Text lineHeight="normal">
            <strong>
              {distroEventDetailsData.distroEventData.eventDate?.toDateString()}
            </strong>
          </Text>
          <Text>
            {DistroEventStateLabel.get(
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
                        alignContent="center"
                        justifyItems="center"
                        // py={2}
                        borderTop="1px"
                        borderColor="gray.300"
                        direction='column'
                      >
                        <Box
                          as={Button}
                          _hover={{ backgroundColor: "gray.100" }}
                          backgroundColor="transparent"
                          borderRadius="0px"
                          my={2}
                          onClick={(e) => {
                            onFirstOpen();
                            setChosenPackingItemId(item.numberOfItems); 
                          }}
                          flex="1"
                          textAlign="center"
                        >
                          {item.numberOfItems} x {item.size}
                        </Box>
                        <Box fontSize='sm'>
                          Box 293730: 20
                        </Box>
                        <Box fontSize='sm'>
                           Box 293720: 3
                        </Box>
                        <Box fontSize='sm'>
                           Unboxed Items: 2
                        </Box>
                        {/* the checkbox fires 2 times on the onclick => to be corrected */}
                        {/* <Flex
                        alignItems="center"
                        onClick={() => onCheckboxClick()}
                      >
                        <Checkbox />
                      </Flex> */}
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
          // onOtherSource,
        }}
      />
      <SecondOverlay
        modalProps={{ isSecondOpen, onSecondClose, onThirdOpen }}
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
