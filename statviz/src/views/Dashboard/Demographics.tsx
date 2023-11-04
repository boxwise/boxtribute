import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Wrap,
  WrapItem,
  Box,
} from "@chakra-ui/react";
import DemographicChart from "../../components/visualizations/DemographicChart";

export default function Demographics() {
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="lg">Demographics</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Wrap gap={6}>
          <WrapItem overflow="auto" padding="5px">
            <DemographicChart width={600} height={700} />
          </WrapItem>
        </Wrap>
      </AccordionPanel>
    </AccordionItem>
  );
}
