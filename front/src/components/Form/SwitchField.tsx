import { HStack, Switch, Text } from "@chakra-ui/react";
import { Control, Controller } from "react-hook-form";

type IInShopSwitchProps = {
  fieldId: string;
  fieldLabel: string;
  control: Control<any>;
};

function SwitchField({ fieldId, fieldLabel, control }: IInShopSwitchProps) {
  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field: { onChange, value } }) => (
        <HStack p={2}>
          <Switch
            id={`${fieldId}-switch`}
            mr={2}
            isChecked={value ?? false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <Text fontWeight="medium" fontSize="md">
            {fieldLabel}
          </Text>
        </HStack>
      )}
    />
  );
}

export default SwitchField;
