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
  ButtonGroup,
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
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton _expanded={{ bg: "#F4E6A0" }}>
                  <Box flex="1" textAlign="left">
                    <Flex>
                      <Box>
                        <Text>
                          {item.category} {item?.gender || ""} ({item.totalItems}x)
                        </Text>
                      </Box>
                      <Spacer />
                      <ButtonGroup gap={1}>
                        <Box>
                          <Text>{item.totalBoxes} boxes</Text>
                        </Box>
                        {!isExpanded && <AccordionIcon />}
                        {isExpanded && <Box w="1em" h="1em" />}
                      </ButtonGroup>
                    </Flex>
                  </Box>
                </AccordionButton>
              </h2>
              <AccordionPanel p={0}>
                <ShipmentTable boxes={item.boxes} />
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ShipmentContent;
