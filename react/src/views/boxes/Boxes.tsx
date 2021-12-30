import { Box, Heading, HStack, Input, VStack } from "@chakra-ui/react";
import React from "react";

const Boxes = () => {
  return (
    <VStack align="left">
      <Heading as="h1">Boxes</Heading>
      <VStack align="left">
        <Heading as="h2">Search for a box</Heading>
        <Input placeholder='Enter box id' />
      </VStack>
    </VStack>
  );
};

export default Boxes;
