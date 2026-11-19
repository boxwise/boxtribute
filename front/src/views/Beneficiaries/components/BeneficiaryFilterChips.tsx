import { useMemo } from "react";
import { Button, Flex, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import {
  IBeneficiaryFilters,
  QUICK_FILTER_LABELS,
  countActiveFilters,
} from "../beneficiariesViewUrlState";

type FilterKey = keyof IBeneficiaryFilters;

interface IBeneficiaryFilterChipsProps {
  filters: IBeneficiaryFilters;
  tagOptions: IFilterValue[];
  /** `value` is omitted for the filters without multiple values (the created dates) */
  onRemoveFilter: (key: FilterKey, value?: string) => void;
  onClearAllFilters: () => void;
}

interface IChip {
  key: string;
  testId: string;
  label: string;
  isExcluded?: boolean;
  onRemove: () => void;
}

export function BeneficiaryFilterChips({
  filters,
  tagOptions,
  onRemoveFilter,
  onClearAllFilters,
}: IBeneficiaryFilterChipsProps) {
  const chips = useMemo(() => {
    const tagLabel = (id: string) => tagOptions.find((tag) => tag.value === id)?.label ?? id;
    const result: IChip[] = [];

    filters.genders.forEach((gender) =>
      result.push({
        key: `genders-${gender}`,
        testId: `filter-chip-genders-${gender}`,
        label: gender,
        onRemove: () => onRemoveFilter("genders", gender),
      }),
    );
    filters.tagIds.forEach((id) =>
      result.push({
        key: `tagIds-${id}`,
        testId: `filter-chip-tagIds-${id}`,
        label: tagLabel(id),
        onRemove: () => onRemoveFilter("tagIds", id),
      }),
    );
    filters.excludedTagIds.forEach((id) =>
      result.push({
        key: `excludedTagIds-${id}`,
        testId: `filter-chip-excludedTagIds-${id}`,
        label: tagLabel(id),
        isExcluded: true,
        onRemove: () => onRemoveFilter("excludedTagIds", id),
      }),
    );
    if (filters.createdFrom) {
      result.push({
        key: "createdFrom",
        testId: "filter-chip-createdFrom",
        label: `From ${filters.createdFrom}`,
        onRemove: () => onRemoveFilter("createdFrom"),
      });
    }
    if (filters.createdTo) {
      result.push({
        key: "createdTo",
        testId: "filter-chip-createdTo",
        label: `To ${filters.createdTo}`,
        onRemove: () => onRemoveFilter("createdTo"),
      });
    }
    filters.quickFilters.forEach((quickFilter) =>
      result.push({
        key: `quickFilters-${quickFilter}`,
        testId: `filter-chip-quickFilters-${quickFilter}`,
        label: QUICK_FILTER_LABELS[quickFilter],
        onRemove: () => onRemoveFilter("quickFilters", quickFilter),
      }),
    );
    return result;
  }, [filters, tagOptions, onRemoveFilter]);

  if (chips.length === 0) {
    return null;
  }

  return (
    <Flex alignItems="center" flexWrap="wrap" gap={2} py={2} data-testid="filter-chips">
      {chips.map((chip) => (
        <Tag key={chip.key} size="lg" variant="solid" colorScheme="gray" data-testid={chip.testId}>
          <TagLabel textDecoration={chip.isExcluded ? "line-through" : "none"}>
            {chip.label}
          </TagLabel>
          <TagCloseButton onClick={chip.onRemove} data-testid={`${chip.testId}-close`} />
        </Tag>
      ))}
      <Button
        variant="ghost"
        size="md"
        onClick={onClearAllFilters}
        colorScheme="gray"
        data-testid="clear-all-filters-button"
      >
        Clear filters ({countActiveFilters(filters)})
      </Button>
    </Flex>
  );
}
