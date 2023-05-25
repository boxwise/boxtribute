import {
  Accordion,
  AccordionItem,
  AccordionButton,
  Text,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { RiQuestionFill } from "react-icons/ri";
import { ShipmentDetail } from "types/generated/graphql";

interface IBoxReconciliationContainerProps {
  shipmentDetail: ShipmentDetail | undefined;
}

export function BoxReconciliationContainer({ shipmentDetail }: IBoxReconciliationContainerProps) {
  return (
    <Accordion defaultIndex={[0]}>
      <AccordionItem>
        <h2>
          <AccordionButton p={4}>
            <Box flex="1" textAlign="left" fontWeight="bold">
              1. MATCH PRODUCTS
            </Box>
            <RiQuestionFill size={20} />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          <Text>Product & Gender: </Text>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton p={4}>
            <Box flex="1" textAlign="left" fontWeight="bold">
              2. RECEIVE LOCATION
            </Box>
            <RiQuestionFill size={20} />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
