import { useCallback, useState } from "react";
import { VStack, Button, SimpleGrid, Box, FormLabel } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
  StockAppliedFilters,
} from "../../utils/dashboardFilters";
import { genders } from "./constants";
import { toFilterValues, toProductFilterValues } from "../../utils/dashboardFilters";

interface StockFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: StockAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  tags: ITagOption[];
  onApply: (filters: StockAppliedFilters) => void;
}

export function StockFilters({
  isOpen,
  onClose,
  appliedFilters,
  products,
  categories,
  locations,
  tags,
  onApply,
}: StockFiltersProps) {
  const [prevAppliedFilters, setPrevAppliedFilters] = useState(appliedFilters);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const [staged, setStaged] = useState<StockAppliedFilters>(appliedFilters);

  if (
    isOpen !== prevIsOpen ||
    JSON.stringify(appliedFilters) !== JSON.stringify(prevAppliedFilters)
  ) {
    setPrevIsOpen(isOpen);
    setPrevAppliedFilters(appliedFilters);

    if (isOpen) {
      setStaged(appliedFilters);
    }
  }

  const productOptions = toProductFilterValues(products);
  const categoryOptions = toFilterValues(categories);
  const locationOptions = toFilterValues(locations);

  const handleApply = useCallback(() => {
    onApply(staged);
    onClose();
  }, [staged, onApply, onClose]);

  const handleClear = useCallback(() => {
    setStaged({
      products: [],
      genders: [],
      categories: [],
      locations: [],
      includedTags: [],
      excludedTags: [],
    });
  }, []);

  const selectedProductValues = productOptions.filter((o) =>
    staged.products.some((p) => String(p.id) === o.value),
  );
  const selectedCategoryValues = categoryOptions.filter((o) =>
    staged.categories.some((c) => String(c.id) === o.value),
  );
  const selectedLocationValues = locationOptions.filter((o) =>
    staged.locations.some((l) => String(l.id) === o.value),
  );
  const selectedGenderValues = genders.filter((g) => staged.genders.includes(g.value));

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={1} spacing={4}>
        <MultiSelectFilter
          fieldLabel="Product gender"
          values={genders}
          filterId="sg-staged"
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
          filterId="sp-staged"
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
          filterId="sc-staged"
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
        <MultiSelectFilter
          fieldLabel="Location"
          values={locationOptions}
          filterId="sl-staged"
          filterValue={selectedLocationValues}
          onFilterChange={(selected) => {
            const selectedIds = selected.map((s) => Number(s.value));
            setStaged((prev) => ({
              ...prev,
              locations: locations.filter((l) => selectedIds.includes(l.id)),
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
            data-testid="stock-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="stock-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
