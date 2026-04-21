import { useCallback, useMemo } from "react";
import { Flex, Tag, TagLabel, TagCloseButton, Button } from "@chakra-ui/react";
import { Filters } from "react-table";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

interface ProductsFilterChipsProps {
  filters: Filters<any>;
  categoryOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeRangeOptions: IFilterValue[];
  onRemoveFilter: (filterId: string, valueToRemove?: string) => void;
  onClearAllFilters: () => void;
}

const FILTER_CONFIG = {
  category: { label: "Category" },
  gender: { label: "Gender" },
  sizeRange: { label: "Size Range" },
} as const;

export function ProductsFilterChips({
  filters,
  categoryOptions,
  genderOptions,
  sizeRangeOptions,
  onRemoveFilter,
  onClearAllFilters,
}: ProductsFilterChipsProps) {
  const optionsMap = useMemo(
    () => ({
      category: categoryOptions,
      gender: genderOptions,
      sizeRange: sizeRangeOptions,
    }),
    [categoryOptions, genderOptions, sizeRangeOptions],
  );

  const getValueLabel = useCallback(
    (filterId: string, value: string): string => {
      const options = optionsMap[filterId as keyof typeof optionsMap];
      const option = options?.find((opt) => opt.value === value);
      return option?.label || value;
    },
    [optionsMap],
  );

  if (filters.length === 0) {
    return null;
  }

  return (
    <Flex
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      py={2}
      px={0}
      bg="transparent"
      data-testid="products-filter-chips"
    >
      {filters.map((filter) => {
        const filterConfig = FILTER_CONFIG[filter.id as keyof typeof FILTER_CONFIG];
        if (!filterConfig) return null;

        const values = Array.isArray(filter.value) ? filter.value : [filter.value];

        return values.map((value: string, index: number) => {
          const label = getValueLabel(filter.id, value);
          return (
            <Tag
              key={`${filter.id}-${value}-${index}`}
              size="lg"
              variant="solid"
              colorScheme="gray"
              data-testid={`products-filter-chip-${filter.id}-${value}`}
            >
              <TagLabel>{label}</TagLabel>
              <TagCloseButton
                onClick={() => onRemoveFilter(filter.id, value)}
                data-testid={`products-filter-chip-close-${filter.id}-${value}`}
              />
            </Tag>
          );
        });
      })}
      <Button
        variant="ghost"
        size="md"
        onClick={onClearAllFilters}
        colorScheme="gray"
        data-testid="products-clear-all-filters-button"
      >
        Clear filters (
        {filters.reduce((acc, f) => acc + (Array.isArray(f.value) ? f.value.length : 1), 0)})
      </Button>
    </Flex>
  );
}
