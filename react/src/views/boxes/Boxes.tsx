import React from "react";
import { Button, FormControl, FormErrorMessage, Heading, Input, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

const Boxes = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm({
    mode: "onChange"
  });

  const onSubmit = (values) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        resolve(values);
      }, 1000);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack align="left">
        <Heading as="h2">Search for a box</Heading>
        <FormControl isInvalid={errors.boxNumber}>
          <Input
            id="boxNumber"
            placeholder="Enter box id (only numbers allowed)"
            {...register("boxNumber", {
              required: "Box number is required",
              minLength: { value: 4, message: "A Boxnumber has at least 4 digits" },
            })}
            type="number"
          />
          <FormErrorMessage>{errors.boxNumber && errors.boxNumber.message}</FormErrorMessage>
        </FormControl>
        <Button isLoading={isSubmitting} type="submit" disabled={!isDirty || !isValid || isSubmitting} >
          Search
        </Button>
      </VStack>
    </form>
  );
};

export default Boxes;
