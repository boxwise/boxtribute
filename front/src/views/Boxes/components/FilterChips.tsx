import { useCallback, useMemo } from "react";
import { Flex, Tag, TagLabel, TagCloseButton, Button } from "@chakra-ui/react";
import { Filters } from "react-table";
import { boxStateIds } from "utils/constants";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

interface FilterChipsProps {
  filters: Filters<any>;
  productOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeOptions: IFilterValue[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
  onRemoveFilter: (filterId: string, valueToRemove?: string) => void;
  onClearAllFilters: () => void;
}

// Filter display configuration
const FILTER_CONFIG = {
  product: { label: "Product" },
  gender: { label: "Gender" },
  size: { label: "Size" },
  state: { label: "Status" },
  location: { label: "Location" },
  tags: { label: "Tags" },
  no_tags: { label: "Exclude Tags" },
} as const;

export function FilterChips({
  filters,
  productOptions,
  genderOptions,
  sizeOptions,
  locationOptions,
  tagOptions,
  onRemoveFilter,
  onClearAllFilters,
}: FilterChipsProps) {
  // Map of filter options for lookups
  const optionsMap = useMemo(
    () => ({
      product: productOptions,
      gender: genderOptions,
      size: sizeOptions,
      location: locationOptions,
      tags: tagOptions,
      no_tags: tagOptions,
    }),
    [productOptions, genderOptions, sizeOptions, locationOptions, tagOptions],
  );

  // Get label for a filter value
  const getValueLabel = useCallback(
    (filterId: string, value: string): string => {
      if (filterId === "state") {
        // Special handling for state - use boxStateIds mapping
        const stateName = Object.keys(boxStateIds).find((name) => boxStateIds[name] === value);
        return stateName || value;
      }

      const options = optionsMap[filterId as keyof typeof optionsMap];
      const option = options?.find((opt) => opt.value === value);
      return option?.label || value;
    },
    [optionsMap],
  );

  // Don't render if no filters
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
      data-testid="filter-chips"
    >
      {filters.map((filter) => {
        const filterConfig = FILTER_CONFIG[filter.id as keyof typeof FILTER_CONFIG];
        if (!filterConfig) return null;

        const values = Array.isArray(filter.value) ? filter.value : [filter.value];

        return values.map((value: string, index: number) => {
          const label = getValueLabel(filter.id, value);
          const chipLabel = values.length === 1 ? `${filterConfig.label}: ${label}` : `${label}`;

          return (
            <Tag
              key={`${filter.id}-${value}-${index}`}
              size="lg"
              variant="solid"
              colorScheme="gray"
              data-testid={`filter-chip-${filter.id}-${value}`}
            >
              <TagLabel>{chipLabel}</TagLabel>
              <TagCloseButton
                onClick={() => onRemoveFilter(filter.id, value)}
                data-testid={`filter-chip-close-${filter.id}-${value}`}
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
        data-testid="clear-all-filters-button"
      >
        Clear filters (
        {filters.reduce((acc, f) => acc + (Array.isArray(f.value) ? f.value.length : 1), 0)})
      </Button>
    </Flex>
  );
}
