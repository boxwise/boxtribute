import { useCallback, useEffect, useState, useMemo } from "react";
import { VStack, Button, Box, FormControl, FormLabel, SimpleGrid } from "@chakra-ui/react";
import { Filters } from "react-table";
import { boxStateIds } from "utils/constants";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import TabbedTagDropdown from "@boxtribute/shared-components/statviz/components/filter/TabbedTagDropdown";
import type { ITagFilterValue } from "@boxtribute/shared-components/statviz/state/filter";

interface BoxesFilterProps {
  isOpen: boolean;
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  productOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeOptions: IFilterValue[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
}

export function BoxesFilter({
  isOpen,
  onClose,
  columnFilters,
  onApplyFilters,
  productOptions,
  genderOptions,
  sizeOptions,
  locationOptions,
  tagOptions,
}: BoxesFilterProps) {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>({});

  // Convert IFilterValue[] to ITagFilterValue[] for TabbedTagDropdown
  const tagFilterValues: ITagFilterValue[] = useMemo(
    () =>
      tagOptions.map((tag) => ({
        ...tag,
        id: parseInt(tag.value, 10),
        color: (tag as any).color || "#000000", // Default color if missing
      })),
    [tagOptions],
  );

  // Get included and excluded tags from stagedFilters
  const includedTags = useMemo(
    () => tagFilterValues.filter((tag) => stagedFilters.tags?.includes(tag.value)),
    [tagFilterValues, stagedFilters.tags],
  );

  const excludedTags = useMemo(
    () => tagFilterValues.filter((tag) => stagedFilters.no_tags?.includes(tag.value)),
    [tagFilterValues, stagedFilters.no_tags],
  );

  const handleIncludedTagsChange = useCallback((tags: ITagFilterValue[]) => {
    setStagedFilters((prev) => ({
      ...prev,
      tags: tags.map((t) => t.value),
    }));
  }, []);

  const handleExcludedTagsChange = useCallback((tags: ITagFilterValue[]) => {
    setStagedFilters((prev) => ({
      ...prev,
      no_tags: tags.map((t) => t.value),
    }));
  }, []);

  const handleClearAllTags = useCallback(() => {
    setStagedFilters((prev) => ({
      ...prev,
      tags: [],
      no_tags: [],
    }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      const filtersMap: Record<string, string[]> = {};
      columnFilters.forEach((filter) => {
        if (filter.value == null) {
          return;
        }
        if (Array.isArray(filter.value)) {
          filtersMap[filter.id] = filter.value.map(String);
        } else {
          filtersMap[filter.id] = [String(filter.value)];
        }
      });
      setStagedFilters(filtersMap);
    }
  }, [isOpen, columnFilters]);

  const handleFilterChange = useCallback((filterId: string, values: string[]) => {
    setStagedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  }, []);

  const handleApply = useCallback(() => {
    const filters: Filters<any> = Object.entries(stagedFilters)
      .filter(([, value]) => value.length > 0)
      .map(([id, value]) => ({ id, value }));
    onApplyFilters(filters);
    onClose();
  }, [stagedFilters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setStagedFilters({});
  }, []);

  const stateOptions = Object.entries(boxStateIds).map(([name, id]) => ({
    label: name,
    value: id,
    urlId: id,
  }));

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
        <MultiSelectFilter
          fieldLabel="Product"
          values={productOptions}
          filterId="product"
          filterValue={productOptions.filter((o) => stagedFilters.product?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "product",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Gender"
          values={genderOptions}
          filterId="gender"
          filterValue={genderOptions.filter((o) => stagedFilters.gender?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "gender",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Size"
          values={sizeOptions}
          filterId="size"
          filterValue={sizeOptions.filter((o) => stagedFilters.size?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "size",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Status"
          values={stateOptions}
          filterId="state"
          filterValue={stateOptions.filter((o) => stagedFilters.state?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "state",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Location"
          values={locationOptions}
          filterId="location"
          filterValue={locationOptions.filter((o) => stagedFilters.location?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "location",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <FormControl>
          <FormLabel>Tags</FormLabel>
          <TabbedTagDropdown
            availableTags={tagFilterValues}
            includedTags={includedTags}
            excludedTags={excludedTags}
            onIncludedChange={handleIncludedTagsChange}
            onExcludedChange={handleExcludedTagsChange}
            onClearAll={handleClearAllTags}
            placeholder="All"
          />
        </FormControl>
      </SimpleGrid>

      <Box pt={4}>
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            width="100%"
            data-testid="boxes-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="boxes-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
