import { Field, Input, Text } from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export interface IDateFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
  required?: boolean;
  minDate?: any;
  maxDate?: any;
}

function DateField({
  fieldId,
  fieldLabel,
  errors,
  control,
  register,
  required = true,
  minDate = "",
  maxDate = "",
}: IDateFieldProps) {
  return (
    <Field.Root invalid={!!errors[fieldId]} id={fieldId}>
      <Field.Label htmlFor={fieldId}>
        {fieldLabel}{" "}
        {required && (
          <Text as="span" color="red.500">
            *
          </Text>
        )}
      </Field.Label>
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
      <Field.ErrorText>{!!errors[fieldId] && errors[fieldId].message}</Field.ErrorText>
    </Field.Root>
  );
}
export default DateField;
