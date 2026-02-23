import { Stack, Text, Flex } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { ITagFilterValue } from "../../state/tagFilterDashboard";

interface IMultiSelectListProps {
  values: ITagFilterValue[];
  selectedValues: ITagFilterValue[];
  onChange: (selected: ITagFilterValue[]) => void;
}

/**
 * Reusable multi-select list component for tag filtering.
 * Displays a list with CheckIcon on the right for selected items.
 */
export default function MultiSelectList({
  values,
  selectedValues,
  onChange,
}: IMultiSelectListProps) {
  const handleToggle = (tag: ITagFilterValue) => {
    const isSelected = selectedValues.some((v) => v.id === tag.id);
    const newSelected = isSelected
      ? selectedValues.filter((v) => v.id !== tag.id)
      : [...selectedValues, tag];
    onChange(newSelected);
  };

  return (
    <Stack spacing={0} maxH="300px" overflowY="auto" p={2}>
      {values.length === 0 ? (
        <Text color="gray.500" fontSize="sm" p={2}>
          No tags available
        </Text>
      ) : (
        values.map((tag) => {
          const isSelected = selectedValues.some((v) => v.id === tag.id);
          return (
            <Flex
              key={tag.id}
              align="center"
              justify="space-between"
              px={2}
              py={1.5}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleToggle(tag)}
            >
              <Text as="span" color="black">
                {tag.label}
              </Text>
              {isSelected && <CheckIcon color="black" boxSize="16px" />}
            </Flex>
          );
        })
      )}
    </Stack>
  );
}
