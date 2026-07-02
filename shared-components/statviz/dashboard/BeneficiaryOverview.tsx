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
import DemographicDataContainer from "../components/visualizations/demographic/DemographicDataContainer";
import BeneficiaryFiguresDataContainer from "../components/visualizations/demographic/BeneficiaryFiguresDataContainer";
import BeneficiaryReachDataContainer from "../components/visualizations/demographic/BeneficiaryReachDataContainer";
import {
  readDemographicsFiltersFromUrl,
  writeDemographicsFiltersToUrl,
  type DemographicsAppliedFilters,
  type ITagOption,
} from "../utils/dashboardFilters";
import { FilterPanel } from "../../filter/FilterPanel";
import { BeneficiaryFilters } from "./../components/filter/BeneficiaryFilters";

interface DemographicsProps {
  tags: ITagOption[];
}

export default function BeneficiaryOverview({ tags }: DemographicsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readDemographicsFiltersFromUrl(searchParams, tags),
    [searchParams, tags],
  );

  const handleApplyFilters = useCallback(
    (filters: DemographicsAppliedFilters) => {
      const newParams = new URLSearchParams(searchParams);
      writeDemographicsFiltersToUrl(filters, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Beneficiary Overview</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <VStack align="stretch" spacing={4}>
          <HStack justify="flex-end">
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
          </HStack>
          <SimpleGrid minChildWidth="300px" columns={{ base: 1, md: 3 }} spacing={4}>
            <BeneficiaryFiguresDataContainer />
            <Box gridColumn={{ md: "span 2" }}>
              <DemographicDataContainer appliedFilters={appliedFilters} />
            </Box>
          </SimpleGrid>
          <BeneficiaryReachDataContainer appliedFilters={appliedFilters} />
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
