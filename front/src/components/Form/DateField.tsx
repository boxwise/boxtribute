import { FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";

export interface IDateFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: FieldErrors;
  control: Control<
    {
      from?: Date | undefined;
      to?: Date | undefined;
    },
    unknown,
    {
      from?: string | undefined;
      to?: string | undefined;
    }
  >;
  register: UseFormRegister<{
    from?: Date | undefined;
    to?: Date | undefined;
  }>;
  isRequired?: boolean;
  minDate?: string | number | undefined;
  maxDate?: string | number | undefined;
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
        name={fieldId as "from" | "to"}
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
            {...register(field.name as "from" | "to", {
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
