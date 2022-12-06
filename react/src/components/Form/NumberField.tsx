import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { Controller } from "react-hook-form";

export interface INumberFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
}

function NumberField({ fieldId, fieldLabel, errors, control, register }: INumberFieldProps) {
  return (
    <FormControl isInvalid={!!errors[fieldId]}>
      <FormLabel htmlFor="numberOfItems" textAlign="left">
        {fieldLabel}{" "}
        <Text as="span" color="red.500">
          *
        </Text>
      </FormLabel>
      {/* The React Form Controller is needed because the Input is actually in NumberInputField and not in Number Input chakraUI components */}
      {/* https://react-hook-form.com/api/usecontroller/controller */}
      {/* https://codesandbox.io/s/chakra-ui-5mp8g */}
      {/* Please do not put any validation or rules in here. This is set where the component is imported. */}
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <NumberInput min={0}>
            {/* The NumberInputField only returns strings and needs to be casted before validation is possible */}
            <NumberInputField
              onKeyDown={(e) => {
                // prevent entering negetive number
                if (e.code === "Minus") {
                  e.preventDefault();
                }
              }}
              border="2px"
              borderRadius="0"
              borderColor="black"
              {...register(field.name, {
                setValueAs: (val) => {
                  if (typeof val === "number") {
                    // only happens if a number is passed as default value
                    return val;
                  }
                  if (val) {
                    // if a number is entered it is passed as a string
                    return Number(val);
                  }
                  // This is if "" is entered.
                  return undefined;
                },
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
}
export default NumberField;
