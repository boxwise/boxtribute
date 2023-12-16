import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import StockDataContainer from "../../components/visualizations/Stock/StockDataContainer";

export default function StockOverview() {
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="lg">Stock Overview</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <StockDataContainer></StockDataContainer>
      </AccordionPanel>
    </AccordionItem>
  );
}
