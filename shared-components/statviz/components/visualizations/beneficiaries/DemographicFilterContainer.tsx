import { useMemo } from "react";
import DemographicPyramid from "./DemographicPyramid";
import { filterByTags } from "../../../utils/filterByTags";
import type { BeneficiaryAppliedFilters } from "../../../utils/dashboardFilters";
import { AGE_RANGES } from "../../../utils/dashboardFilters";
import {
  BeneficiaryDemographics,
  BeneficiaryDemographicsResult,
} from "../../../../../graphql/types";

interface IDemographicFilterContainerProps {
  demographics: BeneficiaryDemographics;
  appliedFilters: BeneficiaryAppliedFilters;
}

export default function DemographicFilterContainer({
  demographics,
  appliedFilters,
}: IDemographicFilterContainerProps) {
  const { ageRanges, genders, includedTags, excludedTags } = appliedFilters;

  const demographicFacts = useMemo(
    () => (demographics?.facts as BeneficiaryDemographicsResult[]) ?? [],
    [demographics?.facts],
  );

  const filteredFacts = useMemo(() => {
    let filtered = demographicFacts;

    // Filter by age ranges
    if (ageRanges.length > 0) {
      filtered = filtered.filter((fact) => {
        if (fact.age === null || fact.age === undefined) return false;
        return ageRanges.some((rangeLabel) => {
          const range = AGE_RANGES.find((r) => r.label === rangeLabel);
          if (!range) return false;
          return fact.age! >= range.min && fact.age! <= range.max;
        });
      });
    }

    // Filter by human gender
    if (genders.length > 0) {
      filtered = filtered.filter((fact) => genders.includes(fact.gender ?? ""));
    }

    // Apply tag filter (included/excluded)
    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [demographicFacts, ageRanges, genders, includedTags, excludedTags]);

  const demographicCube = {
    ...demographics,
    facts: filteredFacts as BeneficiaryDemographicsResult[],
  };

  return <DemographicPyramid width="100%" height="500" demographics={demographicCube} />;
}
