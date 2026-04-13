import { useCallback } from "react";
import { Flex, Tag, TagLabel, TagCloseButton, Button } from "@chakra-ui/react";
import { Filters } from "react-table";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

interface ShipmentFilterChipsProps {
  filters: Filters<any>;
  sourceBaseOptions: IFilterValue[];
  targetBaseOptions: IFilterValue[];
  onRemoveFilter: (filterId: string, valueToRemove?: string) => void;
  onClearAllFilters: () => void;
}

const FILTER_LABELS: Record<string, string> = {
  sourceBaseOrg: "Sent from",
  targetBaseOrg: "Sent to",
  state: "Status",
};

export function ShipmentFilterChips({
  filters,
  sourceBaseOptions,
  targetBaseOptions,
  onRemoveFilter,
  onClearAllFilters,
}: ShipmentFilterChipsProps) {
  const getValueLabel = useCallback(
    (filterId: string, value: string): string => {
      if (filterId === "state") {
        return value;
      }
      if (filterId === "sourceBaseOrg") {
        const opt = sourceBaseOptions.find((o) => o.value === value);
        return opt?.label || value;
      }
      if (filterId === "targetBaseOrg") {
        const opt = targetBaseOptions.find((o) => o.value === value);
        return opt?.label || value;
      }
      return value;
    },
    [sourceBaseOptions, targetBaseOptions],
  );

  // Only show chips for known filter dimensions (not direction)
  const visibleFilters = filters.filter((f) => f.id in FILTER_LABELS);

  const totalFilterCount = visibleFilters.reduce(
    (acc, f) => acc + (Array.isArray(f.value) ? f.value.length : 1),
    0,
  );

  if (visibleFilters.length === 0) {
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
      {visibleFilters.map((filter) => {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];

        return values.map((value: string, index: number) => (
          <Tag
            key={`${filter.id}-${value}-${index}`}
            size="lg"
            variant="solid"
            colorScheme="gray"
            data-testid={`filter-chip-${filter.id}-${value}`}
          >
            <TagLabel>{getValueLabel(filter.id, value)}</TagLabel>
            <TagCloseButton
              onClick={() => onRemoveFilter(filter.id, value)}
              data-testid={`filter-chip-close-${filter.id}-${value}`}
            />
          </Tag>
        ));
      })}
      <Button
        variant="ghost"
        size="md"
        onClick={onClearAllFilters}
        colorScheme="gray"
        data-testid="clear-all-filters-button"
      >
        Clear filters ({totalFilterCount})
      </Button>
    </Flex>
  );
}
