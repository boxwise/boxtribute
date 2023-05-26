import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";
import { Controller } from "react-hook-form";
import { colorIsBright } from "utils/helpers";

export interface IDropdownOption extends OptionBase {
  value: string;
  label: string;
  color?: string | undefined | null;
  data?: object | undefined | null;
}

export interface ISelectFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: IDropdownOption[] | { label: string; options: IDropdownOption[] }[] | undefined;
  errors: object;
  control: any;
  // eslint-disable-next-line react/require-default-props
  placeholder?: string;
  // eslint-disable-next-line react/require-default-props
  isMulti?: boolean;
  // eslint-disable-next-line react/require-default-props
  isRequired?: boolean;
  // eslint-disable-next-line react/require-default-props
  showLabel?: boolean;
  // eslint-disable-next-line react/require-default-props
  showError?: boolean;
}

// The examples from chakra-react-select were super helpful:
// https://www.npmjs.com/package/chakra-react-select#usage-with-react-form-libraries

function SelectField({
  fieldId,
  fieldLabel,
  placeholder,
  showLabel = true,
  showError = true,
  options,
  errors,
  control,
  isMulti = false,
  isRequired = true,
}: ISelectFieldProps) {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!errors[fieldId]} id={fieldId}>
      {showLabel && <FormLabel htmlFor={fieldId}>{fieldLabel}</FormLabel>}
      <Controller
        control={control}
        name={fieldId}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <Select
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            options={options}
            placeholder={placeholder}
            isSearchable
            tagVariant="outline"
            colorScheme="black"
            useBasicStyles
            isMulti={isMulti}
            focusBorderColor="blue.500"
            chakraStyles={{
              control: (provided) => ({
                ...provided,
                border: "2px",
                borderRadius: "0",
                borderColor: "black",
              }),
              multiValue: (provided, state) => ({
                ...provided,
                border: "1px",
                borderColor: colorIsBright(state.data?.color ?? "#fff")
                  ? "gray.300"
                  : state.data?.color,
                color: colorIsBright(state.data?.color ?? "#fff") ? "black" : "white",
                background: state.data?.color || "gray.100",
                borderRadius: "20",
              }),
            }}
          />
        )}
      />
      {showError && (
        <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
      )}
    </FormControl>
  );
}
export default SelectField;
