import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  StackDirection,
  Text,
  extendTheme,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export interface IRadioGroupFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: string[];
  errors: object;
  control: any;
  direction: StackDirection;
  // eslint-disable-next-line react/require-default-props
  isRequired?: boolean;
}

const theme = extendTheme({
  components: {
    Checkbox: {
      // can be Radio
      baseStyle: {
        label: {
          touchAction: "none",
        },
      },
    },
  },
});
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
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
}
export default RadioGroupField;
