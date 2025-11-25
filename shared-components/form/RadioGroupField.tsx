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
import { Controller } from "react-hook-form";

export interface IRadioGroupFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: string[];
  errors: object;
  control: any;
  direction: StackDirection;
  required?: boolean;
}

function RadioGroupField({
  fieldId,
  fieldLabel,
  options,
  errors,
  control,
  direction = "column",
  required = true,
}: IRadioGroupFieldProps) {
  return (
    <FormControl invalid={!!errors[fieldId]} id={fieldId}>
      <FormLabel htmlFor={fieldId}>
        {fieldLabel}{" "}
        {required && (
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
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
}
export default RadioGroupField;
