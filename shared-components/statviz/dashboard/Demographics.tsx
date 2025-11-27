import { Accordion, Heading, Wrap, WrapItem, Box } from "@chakra-ui/react";
import DemographicDataContainer from "../components/visualizations/demographic/DemographicDataContainer";

export default function Demographics() {
  return (
    <Accordion.Item value="demographics">
      <Accordion.ItemTrigger padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Demographics</Heading>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Wrap gap={6}>
          <WrapItem overflow="auto" padding="5px">
            <DemographicDataContainer />
          </WrapItem>
        </Wrap>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
