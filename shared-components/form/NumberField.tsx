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
            onChange={(valueAsString) => {
              // Keep the raw string while the user is mid-typing a decimal (e.g. "1.")
              // so the trailing dot is not stripped by the controlled value round-trip.
              if (!valueAsString) {
                field.onChange("");
                return;
              }
              const parsed = parseFloat(valueAsString);
              if (Number.isNaN(parsed)) {
                field.onChange("");
              } else if (valueAsString.endsWith(".")) {
                // Mid-float: store the raw string so the dot is preserved
                field.onChange(valueAsString);
              } else {
                field.onChange(parsed);
              }
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
