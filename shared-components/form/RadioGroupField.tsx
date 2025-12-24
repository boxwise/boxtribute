import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  StackDirection,
  Text,
} from "@chakra-ui/react";
import { Control, Controller, FieldErrors, FieldValues } from "react-hook-form";

export interface IRadioGroupFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: string[];
  errors: FieldErrors<FieldValues>;
  control: Control<FieldValues>;
  direction: StackDirection;
  isRequired?: boolean;
}

function RadioGroupField({
  fieldId,
  fieldLabel,
  options,
  errors,
  control,
  direction = "column",
  isRequired = true,
}: IRadioGroupFieldProps) {
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
          <RadioGroup {...field} defaultChecked={field.value}>
            <Stack direction={direction}>
              {options.map((opt) => (
                <Radio key={opt} value={opt}>
                  {opt}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
      />
      <FormErrorMessage>{errors[fieldId]?.message?.toString() ?? undefined}</FormErrorMessage>
    </FormControl>
  );
}
export default RadioGroupField;
