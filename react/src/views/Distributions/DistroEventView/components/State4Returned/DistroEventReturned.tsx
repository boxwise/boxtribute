import { Button, Flex, Text } from "@chakra-ui/react";

const DistroEventReturned = () => {
  return (
    <Flex direction="column" w={[300, 420, 500]}>
      <Text fontSize="xl" mb={4}>Make returns by:</Text>
      <Button colorScheme="blue" mx={10} mb={4}>
        The inventory list
      </Button>
      <Button colorScheme="blue" mx={10} mb={4}>
        Scanning the boxes
      </Button>
      <Text fontSize="xl" mb={4}>Shortcuts:</Text>
      <Button colorScheme="blue" mx={10} mb={4} variant="outline">
        All items distributed
      </Button>
      <Button colorScheme="blue" mx={10} mb={4} variant="outline">
        No items returned
      </Button>
    </Flex>
  );
};
export default DistroEventReturned;
