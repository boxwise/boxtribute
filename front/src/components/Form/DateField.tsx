import { FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";
import { Controller, FieldErrors } from "react-hook-form";

export interface IDateFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: FieldErrors;
  control: any;
  register: any;
  isRequired?: boolean;
  minDate?: any;
  maxDate?: any;
}

function DateField({
  fieldId,
  fieldLabel,
  errors,
  control,
  register,
  isRequired = true,
  minDate = "",
  maxDate = "",
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
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Input
            border="2px"
            borderColor="black"
            focusBorderColor="blue.400"
            type="date"
            borderRadius={0}
            mb={2}
            min={minDate}
            max={maxDate}
            aria-invalid={Boolean(errors[fieldId])}
            {...register(field.name, {
              setValueAs: (val) => {
                if (val) {
                  return new Date(val);
                }
                // This is if "" is entered.
                return undefined;
              },
            })}
          />
        )}
      />
      <FormErrorMessage>{errors[fieldId]?.message?.toString() ?? undefined}</FormErrorMessage>
    </FormControl>
  );
}
export default DateField;
