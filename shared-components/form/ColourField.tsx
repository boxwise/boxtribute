import { FormControl, FormLabel, Input, FormErrorMessage, Text } from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export interface ColourFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
  isRequired?: boolean;
}

export const ColourField = ({
  fieldId,
  fieldLabel,
  errors,
  control,
  register,
  isRequired = true,
}: ColourFieldProps) => (
  <FormControl isInvalid={!!errors[fieldId]} id={fieldId}>
    <FormLabel htmlFor={fieldId}>
      {fieldLabel}{" "}
      {isRequired && (
        <Text as="span" color="red.500">
          *
        </Text>
      )}
    </FormLabel>
    <Controller
      name={fieldId}
      control={control}
      render={({ field }) => (
        <Input
          border="2px"
          borderColor="black"
          focusBorderColor="blue.400"
          type="color"
          borderRadius={0}
          mb={2}
          aria-invalid={Boolean(errors[fieldId])}
          {...register(field.name)}
        />
      )}
    />
    <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
  </FormControl>
);
