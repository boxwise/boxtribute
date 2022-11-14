import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";
import { Controller } from "react-hook-form";

export interface IDropdownOption extends OptionBase {
  value: string;
  label: string;
}

export interface ISelectFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: Array<IDropdownOption>;
  errors: object;
  control: any;
  // eslint-disable-next-line react/require-default-props
  placeholder?: string;
  defaultValue: string;
}

// The examples from chakra-react-select were super helpful:
// https://www.npmjs.com/package/chakra-react-select#usage-with-react-form-libraries

function SelectField({
  fieldId,
  fieldLabel,
  placeholder,
  options,
  errors,
  control,
  defaultValue,
}: ISelectFieldProps) {
  return (
    <FormControl isRequired isInvalid={!!errors[fieldId]} id={fieldId}>
      <FormLabel htmlFor={fieldId}>{fieldLabel}</FormLabel>
      <Controller
        control={control}
        name={fieldId}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <Select
            name={name}
            ref={ref}
            onChange={(selectedOption) => onChange(selectedOption?.value)}
            onBlur={onBlur}
            value={options.find((el) => el.value === value || el.value === defaultValue) || null}
            options={options}
            placeholder={placeholder}
            isSearchable
            tagVariant="outline"
            colorScheme="black"
            useBasicStyles
            focusBorderColor="blue.500"
            chakraStyles={{
              control: (provided) => ({
                ...provided,
                border: "2px",
                borderRadius: "0",
                borderColor: "black",
              }),
            }}
          />
        )}
      />
      <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
    </FormControl>
  );
}
export default SelectField;
