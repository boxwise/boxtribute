import { Heading, Box, Accordion } from "@chakra-ui/react";
import StockDataContainer from "../components/visualizations/stock/StockDataContainer";

export default function StockOverview() {
  return (
    <Accordion.Item value="stock-overview">
      <Accordion.ItemTrigger padding="15px 10px" _hover={{ bg: "gray.50" }} cursor="pointer">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Stock Overview</Heading>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <StockDataContainer />
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
