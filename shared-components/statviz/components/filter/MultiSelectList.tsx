import { Box, Checkbox, Stack, Text } from "@chakra-ui/react";
import { ITagFilterValue } from "../../state/tagFilterDashboard";

interface IMultiSelectListProps {
  values: ITagFilterValue[];
  selectedValues: ITagFilterValue[];
  onChange: (selected: ITagFilterValue[]) => void;
  prefix?: string;
}

/**
 * Reusable multi-select list component for tag filtering.
 * Displays a list of checkboxes with tag colors.
 */
export default function MultiSelectList({
  values,
  selectedValues,
  onChange,
  prefix = "",
}: IMultiSelectListProps) {
  const handleToggle = (tag: ITagFilterValue) => {
    const isSelected = selectedValues.some((v) => v.id === tag.id);
    const newSelected = isSelected
      ? selectedValues.filter((v) => v.id !== tag.id)
      : [...selectedValues, tag];
    onChange(newSelected);
  };

  return (
    <Stack spacing={2} maxH="300px" overflowY="auto" p={2}>
      {values.length === 0 ? (
        <Text color="gray.500" fontSize="sm" p={2}>
          No tags available
        </Text>
      ) : (
        values.map((tag) => {
          const isSelected = selectedValues.some((v) => v.id === tag.id);
          return (
            <Box key={tag.id}>
              <Checkbox
                isChecked={isSelected}
                onChange={() => handleToggle(tag)}
                colorScheme="blue"
              >
                <Box display="inline-flex" alignItems="center">
                  <Box
                    as="span"
                    display="inline-block"
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    bg={tag.color}
                    mr={2}
                    border="1px solid"
                    borderColor="gray.300"
                  />
                  <Text as="span">
                    {prefix}
                    {tag.label}
                  </Text>
                </Box>
              </Checkbox>
            </Box>
          );
        })
      )}
    </Stack>
  );
}
