import {
  AccordionItem,
  AccordionButton,
  Heading,
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
import DemographicsFilterPanel from "../components/filter/DemographicsFilterPanel";
import {
  readDemographicsFiltersFromUrl,
  writeDemographicsFiltersToUrl,
  type DemographicsAppliedFilters,
  type ITagOption,
} from "../utils/dashboardFilters";

interface DemographicsProps {
  tags: ITagOption[];
}

export default function Demographics({ tags }: DemographicsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readDemographicsFiltersFromUrl(searchParams, tags),
    // We intentionally only re-derive when URL params change, not when option arrays change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const handleApplyFilters = useCallback(
    (filters: DemographicsAppliedFilters) => {
      const newParams = new URLSearchParams(searchParams);
      writeDemographicsFiltersToUrl(filters, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

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
          <DemographicsFilterPanel
            appliedFilters={appliedFilters}
            tags={tags}
            onApply={handleApplyFilters}
          />
          <Wrap gap={6}>
            <WrapItem overflow="auto" padding="5px">
              <DemographicDataContainer appliedFilters={appliedFilters} />
            </WrapItem>
          </Wrap>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
