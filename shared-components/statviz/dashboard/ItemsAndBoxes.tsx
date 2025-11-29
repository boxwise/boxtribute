import { Box, Accordion, Heading } from "@chakra-ui/react";
import CreatedBoxesDataContainer from "../components/visualizations/createdBoxes/CreatedBoxesDataContainer";

export type BoxesOrItemsCount = "boxesCount" | "itemsCount";

export default function ItemsAndBoxes() {
  return (
    <Accordion.Item value="items-and-boxes">
      <Accordion.ItemTrigger padding="15px 10px" _hover={{ bg: "gray.50" }} cursor="pointer">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Items and Boxes</Heading>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <CreatedBoxesDataContainer />
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
