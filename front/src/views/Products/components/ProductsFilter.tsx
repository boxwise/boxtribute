import { useCallback, useState } from "react";
import { VStack, Button, Box, SimpleGrid } from "@chakra-ui/react";
import { Filters } from "react-table";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

interface ProductsFilterProps {
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  categoryOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeRangeOptions: IFilterValue[];
}

export function ProductsFilter({
  onClose,
  columnFilters,
  onApplyFilters,
  categoryOptions,
  genderOptions,
  sizeRangeOptions,
}: ProductsFilterProps) {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>(() => {
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
    return filtersMap;
  });

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

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
        <MultiSelectFilter
          fieldLabel="Category"
          values={categoryOptions}
          filterId="category"
          filterValue={categoryOptions.filter((o) => stagedFilters.category?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "category",
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
          fieldLabel="Size Range"
          values={sizeRangeOptions}
          filterId="sizeRange"
          filterValue={sizeRangeOptions.filter((o) => stagedFilters.sizeRange?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "sizeRange",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />
      </SimpleGrid>

      <Box pt={4}>
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            width="100%"
            data-testid="products-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="products-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
