import { Heading, Box, Accordion } from "@chakra-ui/react";
import MovedBoxesDataContainer from "../components/visualizations/movedBoxes/MovedBoxesDataContainer";

export default function MovedBoxes() {
  return (
    <Accordion.Item value="moved-boxes">
      <Accordion.ItemTrigger padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Shipments</Heading>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <MovedBoxesDataContainer />
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
