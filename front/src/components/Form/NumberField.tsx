import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberInput,
  Text,
  FormControlProps,
} from "@chakra-ui/react";
import { Control, Controller, FieldErrors } from "react-hook-form";

export interface INumberFieldProps {
  fieldId: string;
  fieldLabel: string;
  errors: object;
  control: any;
  register: any;
  showLabel?: boolean;
  showError?: boolean;
  testId?: any;
}

function NumberField({
  fieldId,
  fieldLabel,
  errors,
  control,
  register,
  showLabel = true,
  showError = true,
  testId,
}: INumberFieldProps) {
  return (
    <FormControl invalid={!!errors[fieldId]}>
      {showLabel && (
        <FormLabel htmlFor="numberOfItems" textAlign="left">
          {fieldLabel}{" "}
          <Text as="span" color="red.500">
            *
          </Text>
        </FormLabel>
      )}
      {/* The React Form Controller is needed because the Input is actually in NumberInputField and not in Number Input chakraUI components */}
      {/* https://react-hook-form.com/api/usecontroller/controller */}
      {/* https://codesandbox.io/s/chakra-ui-5mp8g */}
      {/* Please do not put any validation or rules in here. This is set where the component is imported. */}
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <NumberInput.Root min={0} data-testid={testId}>
            {/* The NumberInputField only returns strings and needs to be casted before validation is possible */}
            <NumberInput.Input
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
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
          </NumberInput.Root>
        )}
      />
      {showError && (
        <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
      )}
    </FormControl>
  );
}
export default NumberField;

// TODO: replace NumberField with NewNumberField
export interface INewNumberFieldProps extends Omit<FormControlProps, "onChange" | "defaultValue"> {
  fieldId: string;
  fieldLabel: string;
  errors: FieldErrors<any>;
  control: Control<any>;
  showLabel?: boolean;
  showError?: boolean;
  required?: boolean;
  testId?: string;
}

export function NewNumberField({
  fieldId,
  fieldLabel,
  errors,
  control,
  showLabel = true,
  showError = true,
  required = false,
  testId,
  ...props
}: INewNumberFieldProps) {
  return (
    <FormControl invalid={!!errors[fieldId]} {...props}>
      {showLabel && (
        <FormLabel htmlFor={fieldId} textAlign="left">
          {fieldLabel}{" "}
          {required && (
            <Text as="span" color="red.500">
              *
            </Text>
          )}
        </FormLabel>
      )}

      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <NumberInput.Root
            min={0}
            data-testid={testId}
            value={field.value ?? ""}
            onValueChange={(_valueAsString, valueAsNumber) => {
              // Convert empty string to undefined if you prefer
              field.onChange(Number.isNaN(valueAsNumber) ? undefined : valueAsNumber);
            }}
          >
            <NumberInput.Input
              onKeyDown={(e) => {
                // block negative sign
                if (e.code === "Minus") {
                  e.preventDefault();
                }
              }}
              border="2px"
              borderRadius="0"
              borderColor="black"
            />
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
          </NumberInput.Root>
        )}
      />
      {showError && <FormErrorMessage>{errors[fieldId]?.message as string}</FormErrorMessage>}
    </FormControl>
  );
}
