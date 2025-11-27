import { Field, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export interface IRadioGroupFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: string[];
  errors: object;
  control: any;
  direction: "horizontal" | "vertical";
  required?: boolean;
}

function RadioGroupField({
  fieldId,
  fieldLabel,
  options,
  errors,
  control,
  direction = "vertical",
  required = true,
}: IRadioGroupFieldProps) {
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
          <RadioGroup.Root {...field} defaultValue={field.value}>
            <Stack direction={direction === "vertical" ? "column" : "row"}>
              {options.map((opt) => (
                <RadioGroup.Item key={opt} value={opt}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText>{opt}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        )}
      />
      <Field.ErrorText>{!!errors[fieldId] && errors[fieldId].message}</Field.ErrorText>
    </Field.Root>
  );
}
export default RadioGroupField;
