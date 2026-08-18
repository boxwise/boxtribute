import { useCallback, useEffect, useState, useMemo } from "react";
import {
  VStack,
  Button,
  Box,
  FormControl,
  FormLabel,
  SimpleGrid,
  Input,
  Text,
} from "@chakra-ui/react";
import { Filters } from "react-table";
import { boxStateIds } from "utils/constants";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import TabbedTagDropdown from "@boxtribute/shared-components/statviz/components/filter/TabbedTagDropdown";
import type { ITagFilterValue } from "@boxtribute/shared-components/statviz/state/filter";

// Default dates: today for "to", one year ago for "from"
const formatLocalDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
const getTodayStr = () => formatLocalDate(new Date());
const getOneYearAgoStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return formatLocalDate(d);
};

interface BoxesFilterProps {
  isOpen: boolean;
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  productOptions: IFilterValue[];
  categoryOptions: IFilterValue[];
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
  categoryOptions,
  genderOptions,
  sizeOptions,
  locationOptions,
  tagOptions,
}: BoxesFilterProps) {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>({});
  const [createdFrom, setCreatedFrom] = useState(getOneYearAgoStr());
  const [createdTo, setCreatedTo] = useState(getTodayStr());

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

      // Sync date range from existing filters
      const createdOnFilter = columnFilters.find((f) => f.id === "createdOn");
      if (createdOnFilter && Array.isArray(createdOnFilter.value)) {
        setCreatedFrom(createdOnFilter.value[0] ?? getOneYearAgoStr());
        setCreatedTo(createdOnFilter.value[1] ?? getTodayStr());
      } else {
        setCreatedFrom(getOneYearAgoStr());
        setCreatedTo(getTodayStr());
      }
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
      .filter(([id, value]) => id !== "createdOn" && value.length > 0)
      .map(([id, value]) => ({ id, value }));

    // Always include createdOn date range when either value is set
    if (createdFrom || createdTo) {
      filters.push({ id: "createdOn", value: [createdFrom, createdTo] });
    }

    onApplyFilters(filters);
    onClose();
  }, [stagedFilters, createdFrom, createdTo, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setStagedFilters({});
    setCreatedFrom(getOneYearAgoStr());
    setCreatedTo(getTodayStr());
  }, []);

  const stateOptions = Object.entries(boxStateIds).map(([name, id]) => ({
    label: name,
    value: id,
    urlId: id,
  }));

  const dateInputStyle = {
    border: "2px solid",
    borderColor: "gray.300",
    borderRadius: "0",
    _hover: { borderColor: "gray.300" },
    _focus: { borderColor: "blue.500", boxShadow: "none" },
  };

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
          fieldLabel="Category"
          values={categoryOptions}
          filterId="productCategory"
          filterValue={categoryOptions.filter((o) =>
            stagedFilters.productCategory?.includes(o.value),
          )}
          onFilterChange={(selected) =>
            handleFilterChange(
              "productCategory",
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

        <FormControl>
          <FormLabel>Created</FormLabel>
          <SimpleGrid columns={2} spacing={2}>
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={1}>
                From
              </Text>
              <Input
                type="date"
                aria-label="Created from"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                data-testid="created-from-input"
                {...dateInputStyle}
              />
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={1}>
                To
              </Text>
              <Input
                type="date"
                aria-label="Created to"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                data-testid="created-to-input"
                {...dateInputStyle}
              />
            </Box>
          </SimpleGrid>
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
