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
  BoxByLabelIdentifierQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { useForm } from "react-hook-form";
import useToggle from "utils/helper-hooks";

interface BoxEditProps {
  boxData:
    | BoxByLabelIdentifierQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  // onMoveToLocationClick: (locationId: string) => void;
}

const BoxEdit = ({
  boxData,
}: // onMoveToLocationClick: moveToLocationClick,
BoxEditProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      size: boxData?.size
    }
  });

  const onSubmitEditForm = (values) => {
    alert(JSON.stringify(values));
  };

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
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
            <FormLabel htmlFor="product" fontWeight={"bold"}>Product:</FormLabel>
            <Input
              id="product"
              {...register("product", {
                required: "This is required",
                minLength: {
                  value: 4,
                  message: "Minimum length should be 4",
                },
              })}
              disabled
            />
          </ListItem>
          <ListItem>
            {/* <FormControl isInvalid={errors.name}>
              {/* <Flex> */}
              <FormLabel htmlFor="box-label">Box Label:</FormLabel>
              <Input
                id="box-label"
                {...register("product", {
                  required: "This is required",
                  minLength: {
                    value: 4,
                    message: "Minimum length should be 4",
                  },
                })}
              />
            </FormControl> */}
          </ListItem>
          <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
              Gender:
            </Text>{" "}
            {boxData.product?.gender}
          </ListItem>
          <ListItem>
          <FormLabel htmlFor="size" fontWeight={"bold"}>Size:</FormLabel>
            <Input
              id="size"
              {...register("size", {
                required: "This is required",
                minLength: {
                  value: 4,
                  message: "Minimum length should be 4",
                },
              })}
              disabled
            />
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

        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
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
