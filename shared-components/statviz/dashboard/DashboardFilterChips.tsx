import { Button, Flex, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";

interface DashboardFilterChip {
  key: string;
  label: string;
  isExcluded?: boolean;
  onRemove: () => void;
}

interface DashboardFilterChipsProps {
  chips: DashboardFilterChip[];
  onClearAllFilters: () => void;
  testIdPrefix: string;
}

export default function DashboardFilterChips({
  chips,
  onClearAllFilters,
  testIdPrefix,
}: DashboardFilterChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <Flex alignItems="center" flexWrap="wrap" gap={2} py={2} px={0} bg="transparent" flex={1}>
      {chips.map((chip) => (
        <Tag key={chip.key} size="lg" variant="solid" colorScheme="gray">
          <TagLabel textDecoration={chip.isExcluded ? "line-through" : "none"}>
            {chip.label}
          </TagLabel>
          <TagCloseButton
            onClick={chip.onRemove}
            data-testid={`${testIdPrefix}-filter-chip-close-${chip.key}`}
          />
        </Tag>
      ))}
      <Button
        variant="ghost"
        size="md"
        onClick={onClearAllFilters}
        colorScheme="gray"
        data-testid={`${testIdPrefix}-clear-all-filters-button`}
      >
        Clear filters ({chips.length})
      </Button>
    </Flex>
  );
}
