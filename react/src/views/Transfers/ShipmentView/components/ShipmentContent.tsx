import {
  Accordion,
  Text,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import ShipmentTable from "./ShipmentTable";

export interface IShipmentContent {
  boxes: any;
  category: string;
  gender: string | undefined;
  totalItems: number;
  totalBoxes: number;
}

interface IShipmentContentProps {
  items: IShipmentContent[];
}

function ShipmentContent({ items }: IShipmentContentProps) {
  return (
    <Accordion allowToggle w="full">
      {items.map((item) => (
        <AccordionItem key={item.category}>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Flex>
                  <Box>
                    <Text>
                      {item.category} {item?.gender || ""} ({item.totalItems}x)
                    </Text>
                  </Box>
                  <Spacer />
                  <Box>
                    <Text>{item.totalBoxes} boxes</Text>
                  </Box>
                </Flex>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel p={0}>
            <ShipmentTable boxes={item.boxes} />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ShipmentContent;
