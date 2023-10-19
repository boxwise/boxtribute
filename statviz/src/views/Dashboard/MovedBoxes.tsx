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

export default function MovedBoxes() {
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="lg">Moved Boxes</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Wrap gap={6}>
          <WrapItem overflow="auto" padding="5px">
            <Heading size="md">Box Flow</Heading>
          </WrapItem>
        </Wrap>
      </AccordionPanel>
    </AccordionItem>
  );
}
