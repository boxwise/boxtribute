import { FormControl, FormErrorMessage, FormLabel, chakra } from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";
import { Controller } from "react-hook-form";
import { colorIsBright } from "utils/helpers";

export interface IDropdownOption extends OptionBase {
  value: string;
  label: string;
  subTitle?: string | undefined | null;
  color?: string | undefined | null;
  data?: object | undefined | null;
}

export interface ISelectFieldProps {
  fieldId: string;
  fieldLabel: string;
  options: IDropdownOption[] | { label: string; options: IDropdownOption[] }[] | undefined;
  errors: object;
  control: any;
  placeholder: string;
  isMulti?: boolean;
  isRequired?: boolean;
  showLabel?: boolean;
  showError?: boolean;
  onChangeProp?: ((event) => void) | undefined;
}

// The examples from chakra-react-select were super helpful:
// https://www.npmjs.com/package/chakra-react-select#usage-with-react-form-libraries

function SelectField({
  fieldId,
  fieldLabel,
  placeholder,
  showLabel,
  showError,
  options,
  errors,
  control,
  isMulti,
  isRequired,
  onChangeProp,
}: ISelectFieldProps) {
  return (
    <FormControl isInvalid={!!errors[fieldId]} id={fieldId}>
      {showLabel && (
        <FormLabel htmlFor={fieldId}>
          {fieldLabel}
          {isRequired && <chakra.span color="red.500"> *</chakra.span>}
        </FormLabel>
      )}
      <Controller
        control={control}
        name={fieldId}
        render={({ field: { onChange, onBlur, value, name, ref } }) => (
          <Select
            name={name}
            ref={ref}
            onChange={
              onChangeProp
                ? (event) => {
                    onChange(event);
                    onChangeProp(event);
                  }
                : onChange
            }
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
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
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

SelectField.defaultProps = {
  isMulti: false,
  isRequired: true,
  showLabel: true,
  showError: true,
  onChangeProp: undefined,
};

export default SelectField;
