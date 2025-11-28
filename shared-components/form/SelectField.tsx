import { Field, chakra, Flex } from "@chakra-ui/react";
import { Select, OptionBase } from "chakra-react-select";
import { Controller } from "react-hook-form";
import { colorIsBright } from "../utils/helpers";

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
  required?: boolean;
  showLabel?: boolean;
  showError?: boolean;
  defaultValue?: string;
  onChangeProp?: (event) => void;
  inlineLabel?: boolean;
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
  required = true,
  defaultValue = undefined,
  onChangeProp = undefined,
  inlineLabel = false,
}: ISelectFieldProps) {
  const labelElement = showLabel && (
    <Field.Label
      htmlFor={fieldId}
      mb={inlineLabel ? 0 : undefined}
      mr={inlineLabel ? 3 : undefined}
    >
      {fieldLabel}
      {required && <chakra.span color="red.500"> *</chakra.span>}
    </Field.Label>
  );

  const selectElement = (
    <Controller
      control={control}
      name={fieldId}
      defaultValue={defaultValue}
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
          isMulti={isMulti}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
          }}
          chakraStyles={{
            control: (provided, state) => ({
              ...provided,
              border: "2px",
              borderRadius: "0",
              borderColor: state.isFocused ? "blue.500" : "black",
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
  );

  return (
    <Field.Root invalid={!!errors[fieldId]} id={fieldId}>
      {inlineLabel ? (
        <Flex alignItems="center">
          {labelElement}
          {selectElement}
        </Flex>
      ) : (
        <>
          {labelElement}
          {selectElement}
        </>
      )}
      {showError && (
        <Field.ErrorText>{!!errors[fieldId] && errors[fieldId].message}</Field.ErrorText>
      )}
    </Field.Root>
  );
}

export default SelectField;
