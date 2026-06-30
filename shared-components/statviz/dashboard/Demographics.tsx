import {
  useDisclosure,
  AccordionItem,
  AccordionButton,
  Heading,
  HStack,
  AccordionIcon,
  AccordionPanel,
  Wrap,
  WrapItem,
  Box,
  VStack,
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
import { DemographicsFilters } from "./../components/filter/DemographicsFilters";

interface DemographicsProps {
  tags: ITagOption[];
}

export default function Demographics({ tags }: DemographicsProps) {
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
              label="Demographics Filters"
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
            >
              <DemographicsFilters
                isOpen={isOpen}
                onClose={onClose}
                appliedFilters={appliedFilters}
                tags={tags}
                onApply={handleApplyFilters}
              />
            </FilterPanel>
          </HStack>
          <Wrap gap={6} align="flex-start">
            <WrapItem flex="1" minWidth="300px" overflow="auto" padding="5px">
              <VStack align="stretch" spacing={4} width="100%">
                <BeneficiaryFiguresDataContainer />
              </VStack>
            </WrapItem>
            <WrapItem overflow="auto" padding="5px">
              <DemographicDataContainer appliedFilters={appliedFilters} />
            </WrapItem>
          </Wrap>
          <Wrap gap={6}>
            <WrapItem overflow="auto" padding="5px">
              <BeneficiaryReachDataContainer appliedFilters={appliedFilters} />
            </WrapItem>
          </Wrap>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
