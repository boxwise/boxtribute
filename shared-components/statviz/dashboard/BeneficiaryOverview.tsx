import {
  useDisclosure,
  AccordionItem,
  AccordionButton,
  Heading,
  HStack,
  AccordionIcon,
  AccordionPanel,
  Box,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DemographicDataContainer from "../components/visualizations/beneficiaries/DemographicDataContainer";
import BeneficiaryFiguresDataContainer from "../components/visualizations/beneficiaries/BeneficiaryFiguresDataContainer";
import BeneficiaryReachDataContainer from "../components/visualizations/beneficiaries/BeneficiaryReachDataContainer";
import {
  readBeneficiaryFiltersFromUrl,
  writeBeneficiaryFiltersToUrl,
  DEFAULT_BENEFICIARY_FILTERS,
  type BeneficiaryAppliedFilters,
  type ITagOption,
} from "../utils/dashboardFilters";
import { FilterPanel } from "../../filter/FilterPanel";
import { BeneficiaryFilters } from "./../components/filter/BeneficiaryFilters";
import DashboardFilterChips from "./DashboardFilterChips";

interface BeneficiaryOverviewProps {
  isActive: boolean;
  tags: ITagOption[];
}

export default function BeneficiaryOverview({ isActive, tags }: BeneficiaryOverviewProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readBeneficiaryFiltersFromUrl(searchParams, tags),
    [searchParams, tags],
  );

  const handleApplyFilters = useCallback(
    (filters: BeneficiaryAppliedFilters) => {
      const newParams = new URLSearchParams(searchParams);
      writeBeneficiaryFiltersToUrl(filters, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const filterChips = useMemo(
    () => [
      ...appliedFilters.ageRanges.map((ageRange) => ({
        key: `age-range-${ageRange}`,
        label: ageRange,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            ageRanges: appliedFilters.ageRanges.filter((range) => range !== ageRange),
          }),
      })),
      ...appliedFilters.genders.map((gender) => ({
        key: `gender-${gender}`,
        label: gender,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            genders: appliedFilters.genders.filter((g) => g !== gender),
          }),
      })),
      ...appliedFilters.includedTags.map((tag) => ({
        key: `included-tag-${tag.id}`,
        label: tag.label,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            includedTags: appliedFilters.includedTags.filter((t) => t.id !== tag.id),
          }),
      })),
      ...appliedFilters.excludedTags.map((tag) => ({
        key: `excluded-tag-${tag.id}`,
        label: tag.label,
        isExcluded: true,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            excludedTags: appliedFilters.excludedTags.filter((t) => t.id !== tag.id),
          }),
      })),
    ],
    [appliedFilters, handleApplyFilters],
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <AccordionItem id="dashboard-section-beneficiaries">
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Beneficiary Overview</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="flex-start">
            <DashboardFilterChips
              chips={filterChips}
              onClearAllFilters={() => handleApplyFilters(DEFAULT_BENEFICIARY_FILTERS)}
              testIdPrefix="beneficiary"
            />
            <Box marginLeft="auto">
              <FilterPanel
                label="Beneficiary Filters"
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
              >
                <BeneficiaryFilters
                  isOpen={isOpen}
                  onClose={onClose}
                  appliedFilters={appliedFilters}
                  tags={tags}
                  onApply={handleApplyFilters}
                />
              </FilterPanel>
            </Box>
          </HStack>
          <SimpleGrid minChildWidth="300px" columns={{ base: 1, md: 3 }} spacing={4}>
            <BeneficiaryFiguresDataContainer isActive={isActive} />
            <Box gridColumn={{ md: "span 2" }}>
              <DemographicDataContainer isActive={isActive} appliedFilters={appliedFilters} />
            </Box>
          </SimpleGrid>
          <BeneficiaryReachDataContainer isActive={isActive} appliedFilters={appliedFilters} />
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
