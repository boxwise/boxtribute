import { FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";
// import { Controller } from "react-hook-form";

export interface IDateFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
  // eslint-disable-next-line react/require-default-props
  isRequired?: boolean;
}

function DateField({
  fieldId,
  fieldLabel,
  errors,
  // control,
  register,
  isRequired = true,
}: IDateFieldProps) {
  return (
    <FormControl isInvalid={!!errors[fieldId]} id={fieldId}>
      <FormLabel htmlFor={fieldId}>
        {fieldLabel}{" "}
        {isRequired && (
          <Text as="span" color="red.500">
            *
          </Text>
        )}
      </FormLabel>
      <Input
        border="2px"
        borderColor="black"
        focusBorderColor="blue.400"
        type="date"
        borderRadius={0}
        min={new Date().getDate().toString()}
        mb={2}
        {...register(fieldId, { required: isRequired })}
      />
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
}
export default DateField;
