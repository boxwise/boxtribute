import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import TabbedTagDropdown from "@boxtribute/shared-components/statviz/components/filter/TabbedTagDropdown";
import type { ITagFilterValue } from "@boxtribute/shared-components/statviz/state/filter";
import {
  BeneficiaryGender,
  GENDERS,
  IBeneficiaryFilters,
  QUICK_FILTERS,
  QUICK_FILTER_LABELS,
  QuickFilter,
} from "../beneficiariesViewUrlState";

interface IBeneficiariesFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IBeneficiaryFilters;
  onApplyFilters: (filters: IBeneficiaryFilters) => void;
  tagOptions: IFilterValue[];
}

const genderOptions: IFilterValue[] = GENDERS.map((gender) => ({
  label: gender,
  value: gender,
  urlId: gender,
}));

const quickFilterOptions: IFilterValue[] = QUICK_FILTERS.map((quickFilter) => ({
  label: QUICK_FILTER_LABELS[quickFilter],
  value: quickFilter,
  urlId: quickFilter,
}));

const EMPTY_FILTERS: IBeneficiaryFilters = {
  genders: [],
  tagIds: [],
  excludedTagIds: [],
  createdFrom: "",
  createdTo: "",
  quickFilters: [],
};

const dateInputStyle = {
  border: "2px solid",
  borderColor: "gray.300",
  borderRadius: "0",
  _hover: { borderColor: "gray.300" },
  _focus: { borderColor: "blue.500", boxShadow: "none" },
};

export function BeneficiariesFilter({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  tagOptions,
}: IBeneficiariesFilterProps) {
  const [staged, setStaged] = useState<IBeneficiaryFilters>(filters);

  // The staged filters start from the applied ones whenever the panel is opened
  useEffect(() => {
    if (isOpen) setStaged(filters);
  }, [isOpen, filters]);

  // Convert IFilterValue[] to ITagFilterValue[] for TabbedTagDropdown
  const tagFilterValues: ITagFilterValue[] = useMemo(
    () =>
      tagOptions.map((tag) => ({
        ...tag,
        id: parseInt(tag.value, 10),
        color: (tag as any).color || "#000000",
      })),
    [tagOptions],
  );
  const includedTags = useMemo(
    () => tagFilterValues.filter((tag) => staged.tagIds.includes(tag.value)),
    [tagFilterValues, staged.tagIds],
  );
  const excludedTags = useMemo(
    () => tagFilterValues.filter((tag) => staged.excludedTagIds.includes(tag.value)),
    [tagFilterValues, staged.excludedTagIds],
  );

  const handleApply = useCallback(() => {
    onApplyFilters(staged);
    onClose();
  }, [staged, onApplyFilters, onClose]);

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={1} spacing={4}>
        <MultiSelectFilter
          fieldLabel="Gender"
          values={genderOptions}
          filterId="gender"
          filterValue={genderOptions.filter((o) =>
            staged.genders.includes(o.value as BeneficiaryGender),
          )}
          onFilterChange={(selected) =>
            setStaged((prev) => ({
              ...prev,
              genders: selected.map((s) => s.value as BeneficiaryGender),
            }))
          }
          placeholder="All"
        />

        <FormControl>
          <FormLabel>Tags</FormLabel>
          <TabbedTagDropdown
            availableTags={tagFilterValues}
            includedTags={includedTags}
            excludedTags={excludedTags}
            onIncludedChange={(tags) =>
              setStaged((prev) => ({ ...prev, tagIds: tags.map((t) => t.value) }))
            }
            onExcludedChange={(tags) =>
              setStaged((prev) => ({ ...prev, excludedTagIds: tags.map((t) => t.value) }))
            }
            onClearAll={() => setStaged((prev) => ({ ...prev, tagIds: [], excludedTagIds: [] }))}
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
                value={staged.createdFrom}
                onChange={(e) => setStaged((prev) => ({ ...prev, createdFrom: e.target.value }))}
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
                value={staged.createdTo}
                onChange={(e) => setStaged((prev) => ({ ...prev, createdTo: e.target.value }))}
                data-testid="created-to-input"
                {...dateInputStyle}
              />
            </Box>
          </SimpleGrid>
        </FormControl>

        <MultiSelectFilter
          fieldLabel="Quick filters"
          values={quickFilterOptions}
          filterId="quickFilters"
          filterValue={quickFilterOptions.filter((o) =>
            staged.quickFilters.includes(o.value as QuickFilter),
          )}
          onFilterChange={(selected) =>
            setStaged((prev) => ({
              ...prev,
              quickFilters: selected.map((s) => s.value as QuickFilter),
            }))
          }
          placeholder="None"
        />
      </SimpleGrid>

      <Box pt={4}>
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            width="100%"
            data-testid="beneficiaries-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={() => setStaged(EMPTY_FILTERS)}
            width="100%"
            data-testid="beneficiaries-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
