import {
  Box,
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
} from "@chakra-ui/react";
import CreatedBoxesDataContainer from "../components/visualizations/createdBoxes/CreatedBoxesDataContainer";

export type BoxesOrItemsCount = "boxesCount" | "itemsCount";

export default function ItemsAndBoxes() {
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Items and Boxes</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <CreatedBoxesDataContainer />
      </AccordionPanel>
    </AccordionItem>
  );
}
