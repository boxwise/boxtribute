import {
  Box,
  List,
  ListItem,
  Heading,
  Button,
  Text,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Flex,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  BoxByLabelIdentifierAndAllProductsQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { useForm } from "react-hook-form";
import useToggle from "utils/helper-hooks";

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierAndAllProductsQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  allProducts: BoxByLabelIdentifierAndAllProductsQuery["products"] | undefined;
}

const ProductsDropdown = ({products}: {products: BoxByLabelIdentifierAndAllProductsQuery["products"]}) => {
  return <Box>The Products Dropdown for {JSON.stringify(products)}</Box>
}


const BoxEdit = ({
  boxData,
  allProducts
}: // onMoveToLocationClick: moveToLocationClick,
BoxEditProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      size: boxData?.size,
    },
  });

  const onSubmitEditForm = (values) => {
    alert(JSON.stringify(values));
  };

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  if (allProducts == null) {
    console.error("BoxDetails Component: allProducts is null");
    return <Box>There was an error: the available products to choose from couldn't be loaded!</Box>;
  }

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        // color={useColorModeValue('yellow.500', 'yellow.300')}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Box Details
      </Text>

      <form onSubmit={handleSubmit(onSubmitEditForm)}>
        <List spacing={2}>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Box Label:
            </Text>{" "}
            {boxData.labelIdentifier}
          </ListItem>
          <ListItem>
            <ProductsDropdown products={allProducts} />
          </ListItem>
          <ListItem>
            <FormControl isInvalid={!!errors?.size}>
              <FormLabel htmlFor="size" fontWeight={"bold"}>
                Size:
              </FormLabel>
              <Input
                id="size"
                // ref={register}
                {...register("size", {
                  required: "This is required",
                  minLength: {
                    value: 4,
                    message: "Minimum length should be 4",
                  },
                })}
              />
              <FormErrorMessage>
                {errors.size && errors.size.message}
              </FormErrorMessage>
            </FormControl>
            <Text as={"span"} fontWeight={"bold"}>
              Gender:
            </Text>{" "}
            {boxData.product?.gender}
          </ListItem>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Items:
            </Text>{" "}
            {boxData.items}
          </ListItem>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Location:
            </Text>{" "}
            {boxData.location?.name}
          </ListItem>
        </List>
        {/* </Flex> */}
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          Update Box
        </Button>
      </form>
    </Box>
  );
};

export default BoxEdit;
