import { Button, Heading, Input, VStack } from "@chakra-ui/react";
import React, { useState } from "react";

const Boxes = () => {
  const [boxNumberInput, setBoxNumberInput] = useState<string>();
  return (
    <VStack align="left">
      <VStack align="left">
        <Heading as="h2">Search for a box</Heading>
        <Input placeholder="Enter box id (only numbers allowed)" type="number" onChange={event => setBoxNumberInput(event.target.value)}/>
        <Button disabled={!boxNumberInput}>Search</Button>
      </VStack>
    </VStack>
  );
};

export default Boxes;
