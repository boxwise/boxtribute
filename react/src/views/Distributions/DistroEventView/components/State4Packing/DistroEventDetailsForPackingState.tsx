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
import { PackingListEntry } from "views/Distributions/types";

export interface DistroEventPackingData {
  distroEventData: any;
}

interface DistroEventDetailsForPackingStateProps {
  packingListEntries: PackingListEntry[];
  onCheckboxClick: () => void;
}

const DistroEventDetailsForPackingState = ({
  packingListEntries,
  onCheckboxClick,
}: DistroEventDetailsForPackingStateProps) => {
  return (
    <Box textAlign="left">
      <Flex direction="column" mb={4}>
        {/* <Text fontSize="xl" mb={1}>
          Distro Event
        </Text> */}
        {/* <Text lineHeight="normal">
          <strong>
            {distroEventDetailsData.distroEventData.distroSpotName}
          </strong>
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
        </Text> */}
      </Flex>
      <Accordion w={[300, 420, 500]} allowToggle>
        {packingListEntries.map((item) => {
          return (
            <AccordionItem w={[300, 420, 500]} justifyItems="center" key={item.id}>
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
                    {item.numberOfItems} x {item.size}
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
export default DistroEventDetailsForPackingState;
