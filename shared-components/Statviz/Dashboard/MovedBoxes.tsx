import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import MovedBoxesDataContainer from "../Components/Visualizations/MovedBoxes/MovedBoxesDataContainer";

export default function MovedBoxes() {
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Moved Boxes</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <MovedBoxesDataContainer />
      </AccordionPanel>
    </AccordionItem>
  );
}
