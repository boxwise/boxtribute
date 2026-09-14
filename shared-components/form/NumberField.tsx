import {
  FormControlProps,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { FieldErrors, Control, Controller } from "react-hook-form";

export interface INumberFieldProps extends Omit<FormControlProps, "onChange" | "defaultValue"> {
  fieldId: string;
  fieldLabel: string;
  errors: FieldErrors<any>;
  control: Control<any>;
  showLabel?: boolean;
  showError?: boolean;
  isRequired?: boolean;
  testId?: string;
  precision?: number;
  step?: number;
}

export function NumberField({
  fieldId,
  fieldLabel,
  errors,
  control,
  showLabel = true,
  showError = true,
  isRequired = false,
  testId,
  precision,
  step,
  ...props
}: INumberFieldProps) {
  return (
    <FormControl {...props} isInvalid={!!errors[fieldId]}>
      {showLabel && (
        <FormLabel htmlFor={fieldId} textAlign="left">
          {fieldLabel}{" "}
          {isRequired && (
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
          <NumberInput
            min={0}
            precision={precision}
            step={step}
            data-testid={testId}
            value={field.value ?? ""}
            onChange={(valueAsString, valueAsNumber) => {
              const allowFloat =
                (typeof precision === "number" && precision > 0) ||
                (typeof step === "number" && !Number.isInteger(step));
              if (valueAsString === "") {
                field.onChange("");
                return;
              }
              // Preserve mid-typing decimals only for float-enabled fields.
              if (allowFloat && (valueAsString === "." || valueAsString.endsWith("."))) {
                field.onChange(valueAsString);
                return;
              }
              field.onChange(Number.isNaN(valueAsNumber) ? "" : valueAsNumber);
            }}
          >
            <NumberInputField
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
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
      />
      {showError && <FormErrorMessage>{errors[fieldId]?.message as string}</FormErrorMessage>}
    </FormControl>
  );
}
