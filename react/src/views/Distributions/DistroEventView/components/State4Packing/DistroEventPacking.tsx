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
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";

export interface DistroEventPackingData {
  distroEventData: any;
}

interface DistroEventPackingProps {
  distroEventDetailsData: DistroEventPackingData;
  onCheckboxClick: () => void;
}

const DistroEventPacking = ({
  distroEventDetailsData,
  onCheckboxClick
}: DistroEventPackingProps) => {
  return (
    <Box textAlign='left'>
        <Flex direction='column' mb={4}>
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
        {distroEventDetailsData.distroEventData.itemsForPacking.map((item) => {
          return (
            <AccordionItem w={[300, 420, 500]} justifyItems="center">
              <Flex justifyItems="center">
                <AccordionButton>
                  <Box flex="1" textAlign="center">
                      <strong>
                    {item.productName} {item.gender}
                    </strong>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Flex>
              <AccordionPanel py={0}>
                <Flex alignContent='center' justifyItems='center' py={2} borderTop="1px" borderColor="gray.300">
                  <Text  flex="1" textAlign="center" >
                    {item.items} x {item.size}
                  </Text>
                  {/* the checkbox fires 2 times on the onclick => it must be corrected */}
                    <Flex alignItems="center" onClick={() => onCheckboxClick()}>
                     <Checkbox/>
                  </Flex>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          );
        }, [])}
      </Accordion>
    </Box>
  );
};
export default DistroEventPacking;
