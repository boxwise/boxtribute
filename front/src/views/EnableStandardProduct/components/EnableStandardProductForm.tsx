import { HStack, Stack, Button, Switch, Box, Text } from "@chakra-ui/react";
import { AlertWithoutAction } from "components/Alerts";
import { useNavigate } from "react-router-dom";

function EnableStandardProductForm() {
  const navigate = useNavigate();
  return (
    <>
      <AlertWithoutAction
        type="info"
        closeable={true}
        alertText=" For ASSORT standard products, only the product description, and free shop settings can be edited."
        mb={2}
      />
      <Box border="2px" mb={8}>
        <HStack mb={4} borderBottom="2px" p={2}>
          <Text fontWeight="bold" fontSize="md">
            PRODUCT SETUP
          </Text>
        </HStack>
        <HStack my={4} p={2}>
          <Switch id="custom-product" mr={2} />
          <Text fontWeight="medium" fontSize="md">
            Custom Product (Base Specific)
          </Text>
        </HStack>
      </Box>
      <Box border="2px" mb={8}>
        <HStack mb={4} borderBottom="2px" p={2}>
          <Text fontWeight="bold" fontSize="md">
            FREE SHOP SETTINGS
          </Text>
        </HStack>
        <HStack my={4} p={2}>
          <Switch id="show-in-stockroom" mr={2} />
          <Text fontWeight="medium" fontSize="md">
            Always Show in Stockroom?
          </Text>
        </HStack>
      </Box>
      <Stack spacing={4} mt={8}>
        <Button
          // isLoading={isFormLoading}
          type="submit"
          borderRadius="0"
          w="full"
          variant="solid"
          backgroundColor="blue.500"
          color="white"
        >
          Enable Product
        </Button>
        <Button
          size="md"
          type="button"
          borderRadius="0"
          w="full"
          variant="outline"
          onClick={() => navigate("../../")}
        >
          Nevermind
        </Button>
      </Stack>
    </>
  );
}

export default EnableStandardProductForm;
