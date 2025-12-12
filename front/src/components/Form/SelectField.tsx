import { FormControl, FormErrorMessage, FormLabel, chakra } from "@chakra-ui/react";
import { CreatableSelect, OptionBase, Select } from "chakra-react-select";
import { Controller } from "react-hook-form";
import { colorIsBright } from "utils/helpers";

export interface IDropdownOption extends OptionBase {
  value: string;
  label: string;
  subTitle?: string | undefined | null;
  color?: string | undefined | null;
  data?: object | undefined | null;
  /** Whether this option should be styled as a special action. Defaults to false. */
  isSpecial?: boolean;
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
  helperText?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  creatable?: boolean;
  onChangeProp?: ((event) => void) | undefined;
  formatOptionLabel?: (
    data: IDropdownOption,
    context: { context: "menu" | "value" },
  ) => React.ReactNode;
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
  isDisabled = false,
  isReadOnly = false,
  isRequired = true,
  onChangeProp = undefined,
  formatOptionLabel,
  creatable,
  helperText,
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
        render={({ field: { onChange, onBlur, value, name, ref } }) => {
          const props = {
            name,
            ref,
            isReadOnly,
            isDisabled,
            onChange: onChangeProp
              ? (event) => {
                  onChange(event);
                  onChangeProp(event);
                }
              : onChange,
            onBlur,
            value,
            options,
            placeholder,
            formatOptionLabel,
            isMulti,
            isSearchable: true,
            tagVariant: "outline" as const,
            tagColorScheme: "black" as const,
            focusBorderColor: "blue.500",
            menuPortalTarget: document.body,
            styles: {
              // zIndex needs to be higher than 1500 to appear in modals and popovers, but not higher so that menues and toasts are above them.
              menuPortal: (provided) => ({ ...provided, zIndex: 1550 }),
            },
            chakraStyles: {
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
            },
          };

          return creatable ? <CreatableSelect {...props} /> : <Select {...props} />;
        }}
      />
      {showError && (
        <FormErrorMessage>{!!errors[fieldId] && errors[fieldId].message}</FormErrorMessage>
      )}
      {helperText && (
        <chakra.p fontSize="sm" color="gray.600" mt={1}>
          {helperText}
        </chakra.p>
      )}
    </FormControl>
  );
}

export default SelectField;
