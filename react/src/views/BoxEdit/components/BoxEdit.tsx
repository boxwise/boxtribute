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
  // onMoveToLocationClick: moveToLocationClick,
}: BoxEditProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const [editFormModeActive, toggleEditFormModeActive] = useToggle(false);

  function onSubmitEditForm(values) {}

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return null;
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
        <FormControl isInvalid={errors.name}>
          <List spacing={2}>
            <ListItem>
            <Text as={"span"} fontWeight={"bold"}>
                Box Label:
              </Text>{" "}
              {boxData.labelIdentifier}
            {/* <Flex> */}
              <FormLabel htmlFor="box-label">Box Label:</FormLabel>
              <Input
                id="product"
                placeholder="Product"
                {...register("product", {
                  required: "This is required",
                  minLength: {
                    value: 4,
                    message: "Minimum length should be 4",
                  },
                })}
                disabled={!editFormModeActive}
              />
            </ListItem>
            <ListItem>
              <FormLabel htmlFor="name">Box Label:</FormLabel>
              <Input
                id="name"
                placeholder="name"
                {...register("name", {
                  required: "This is required",
                  minLength: {
                    value: 4,
                    message: "Minimum length should be 4",
                  },
                })}
                disabled={!editFormModeActive}
              />
              <Text as={"span"} fontWeight={"bold"}>
                Product:
              </Text>{" "}
              {}
            </ListItem>
            <ListItem>
              <Text as={"span"} fontWeight={"bold"}>
                Gender:
              </Text>{" "}
              {boxData.product?.gender}
            </ListItem>
            <ListItem>
              <Text as={"span"} fontWeight={"bold"}>
                Size:
              </Text>{" "}
              {boxData.size}
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
        </FormControl>
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
          disabled={!editFormModeActive}
        >
          Update Box
        </Button>
      </form>

      <Button onClick={toggleEditFormModeActive}>
        {editFormModeActive ? "Cancel" : "Edit Box"}
      </Button>

    </Box>
  );
};

export default BoxEdit;
