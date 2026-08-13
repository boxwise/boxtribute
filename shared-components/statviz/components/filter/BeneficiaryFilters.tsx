import { useCallback, useState } from "react";
import {
  VStack,
  Button,
  SimpleGrid,
  Box,
  CheckboxGroup,
  Checkbox,
  HStack,
  FormLabel,
} from "@chakra-ui/react";
import TabbedTagDropdown from "./TabbedTagDropdown";
import type { ITagOption, BeneficiaryAppliedFilters } from "../../utils/dashboardFilters";
import { AGE_RANGES } from "../../utils/dashboardFilters";

const HUMAN_GENDERS = ["Male", "Female", "Diverse"] as const;

interface BeneficiaryFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: BeneficiaryAppliedFilters;
  tags: ITagOption[];
  onApply: (filters: BeneficiaryAppliedFilters) => void;
}

export function BeneficiaryFilters({
  isOpen,
  onClose,
  appliedFilters,
  tags,
  onApply,
}: BeneficiaryFiltersProps) {
  const [prevAppliedFilters, setPrevAppliedFilters] = useState(appliedFilters);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const [staged, setStaged] = useState<BeneficiaryAppliedFilters>(appliedFilters);

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

  const handleApply = useCallback(() => {
    onApply(staged);
    onClose();
  }, [staged, onApply, onClose]);

  const handleClear = useCallback(() => {
    setStaged({ ageRanges: [], genders: [], includedTags: [], excludedTags: [] });
  }, []);

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={1} spacing={4}>
        <Box>
          <FormLabel mb={2}>Age</FormLabel>
          <CheckboxGroup
            value={staged.ageRanges}
            onChange={(values) => setStaged((prev) => ({ ...prev, ageRanges: values as string[] }))}
          >
            <HStack spacing={4} flexWrap="wrap">
              {AGE_RANGES.map((range) => (
                <Checkbox key={range.label} value={range.label}>
                  {range.label}
                </Checkbox>
              ))}
            </HStack>
          </CheckboxGroup>
        </Box>
        <Box>
          <FormLabel mb={2}>Gender</FormLabel>
          <CheckboxGroup
            value={staged.genders}
            onChange={(values) => setStaged((prev) => ({ ...prev, genders: values as string[] }))}
          >
            <HStack spacing={4}>
              {HUMAN_GENDERS.map((gender) => (
                <Checkbox key={gender} value={gender}>
                  {gender}
                </Checkbox>
              ))}
            </HStack>
          </CheckboxGroup>
        </Box>
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
            data-testid="beneficiary-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="beneficiary-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
