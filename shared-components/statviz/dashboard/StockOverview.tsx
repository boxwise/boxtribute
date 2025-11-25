import { Heading, AccordionPanel, Box, Accordion } from "@chakra-ui/react";
import StockDataContainer from "../components/visualizations/stock/StockDataContainer";

export default function StockOverview() {
  return (
    <Accordion.Item value="">
      <Accordion.ItemTrigger padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Stock Overview</Heading>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <AccordionPanel>
        <StockDataContainer />
      </AccordionPanel>
    </Accordion.Item>
  );
}
