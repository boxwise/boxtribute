import { DistroEvent } from "../State1Planning/DistroEventPlanning";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text,
  Box,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import { groupBy } from "utils/helpers";
import { DistroEventStateLabel } from "views/Distributions/DistroSpotsView/components/DistroSpots";

export interface DistroEventPackingData {
  distroEventData: DistroEvent;
}

interface DistroEventPackingProps {
  distroEventDetailsData: DistroEventPackingData;
  onCheckboxClick: () => void;
}

const DistroEventPacking = ({
  distroEventDetailsData,
  onCheckboxClick,
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
      })),
    };
  });

  return (
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
                <AccordionButton>
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
                      py={2}
                      borderTop="1px"
                      borderColor="gray.300"
                    >
                      <Text flex="1" textAlign="center">
                        {item.numberOfItems} x {item.size}
                      </Text>
                      {/* the checkbox fires 2 times on the onclick => to be corrected */}
                      <Flex
                        alignItems="center"
                        onClick={() => onCheckboxClick()}
                      >
                        <Checkbox />
                      </Flex>
                    </Flex>
                  </AccordionPanel>
                );
              })}
            </AccordionItem>
          );
        }, [])}
      </Accordion>
    </Box>
  );
};
export default DistroEventPacking;
