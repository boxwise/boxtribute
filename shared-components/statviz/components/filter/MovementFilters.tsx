import { useCallback, useEffect, useState } from "react";
import { VStack, Button, SimpleGrid, Box, Input, FormLabel, HStack } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import type {
  IProductOption,
  ICategoryOption,
  ITagOption,
  MovementAppliedFilters,
} from "../../utils/dashboardFilters";
import { genders } from "./constants";
import { toFilterValues, toProductFilterValues } from "../../utils/dashboardFilters";

interface MovementFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: MovementAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  tags: ITagOption[];
  onApply: (filters: MovementAppliedFilters) => void;
}

export function MovementFilters({
  isOpen,
  onClose,
  appliedFilters,
  products,
  categories,
  tags,
  onApply,
}: MovementFiltersProps) {
  const [staged, setStaged] = useState<MovementAppliedFilters>(appliedFilters);

  useEffect(() => {
    if (isOpen) {
      setStaged(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const productOptions = toProductFilterValues(products);
  const categoryOptions = toFilterValues(categories);

  const handleApply = useCallback(() => {
    onApply(staged);
    onClose();
  }, [staged, onApply, onClose]);

  const handleClear = useCallback(() => {
    setStaged((prev) => ({
      ...prev,
      products: [],
      genders: [],
      categories: [],
      includedTags: [],
      excludedTags: [],
    }));
  }, []);

  const selectedProductValues = productOptions.filter((o) =>
    staged.products.some((p) => String(p.id) === o.value),
  );
  const selectedCategoryValues = categoryOptions.filter((o) =>
    staged.categories.some((c) => String(c.id) === o.value),
  );
  const selectedGenderValues = genders.filter((g) => staged.genders.includes(g.value));

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={1} spacing={4}>
        <Box>
          <FormLabel mb={2}>Move date</FormLabel>
          <HStack>
            <Box>
              <FormLabel fontSize="sm">From</FormLabel>
              <Input
                type="date"
                size="md"
                value={staged.dateFrom}
                max={new Date().toISOString().substring(0, 10)}
                onChange={(e) => setStaged((prev) => ({ ...prev, dateFrom: e.target.value }))}
                border="2px"
                borderRadius="0"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "gray.300", boxShadow: "none" }}
              />
            </Box>
            <Box>
              <FormLabel fontSize="sm">To</FormLabel>
              <Input
                type="date"
                size="md"
                value={staged.dateTo}
                max={new Date().toISOString().substring(0, 10)}
                onChange={(e) => setStaged((prev) => ({ ...prev, dateTo: e.target.value }))}
                border="2px"
                borderRadius="0"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "gray.300", boxShadow: "none" }}
              />
            </Box>
          </HStack>
        </Box>
        <MultiSelectFilter
          fieldLabel="Product gender"
          values={genders}
          filterId="mg-staged"
          filterValue={selectedGenderValues}
          onFilterChange={(selected) =>
            setStaged((prev) => ({
              ...prev,
              genders: selected.map((s) => s.value),
            }))
          }
          placeholder="All"
        />
        <MultiSelectFilter
          fieldLabel="Product"
          values={productOptions}
          filterId="mp-staged"
          filterValue={selectedProductValues}
          onFilterChange={(selected) => {
            const selectedIds = selected.map((s) => Number(s.value));
            setStaged((prev) => ({
              ...prev,
              products: products.filter((p) => selectedIds.includes(p.id)),
            }));
          }}
          placeholder="All"
        />
        <MultiSelectFilter
          fieldLabel="Product category"
          values={categoryOptions}
          filterId="mc-staged"
          filterValue={selectedCategoryValues}
          onFilterChange={(selected) => {
            const selectedIds = selected.map((s) => Number(s.value));
            setStaged((prev) => ({
              ...prev,
              categories: categories.filter((c) => selectedIds.includes(c.id)),
            }));
          }}
          placeholder="All"
        />
        <Box>
          <FormLabel mb={2}>Tags</FormLabel>
          <TabbedTagDropdown
            availableTags={tags}
            includedTags={staged.includedTags}
            excludedTags={staged.excludedTags}
            onIncludedChange={(newTags) =>
              setStaged((prev) => ({ ...prev, includedTags: newTags }))
            }
            onExcludedChange={(newTags) =>
              setStaged((prev) => ({ ...prev, excludedTags: newTags }))
            }
            onClearAll={() =>
              setStaged((prev) => ({ ...prev, includedTags: [], excludedTags: [] }))
            }
            placeholder="Select tags"
          />
        </Box>
      </SimpleGrid>
      <Box pt={4}>
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            width="100%"
            data-testid="movement-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="movement-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
