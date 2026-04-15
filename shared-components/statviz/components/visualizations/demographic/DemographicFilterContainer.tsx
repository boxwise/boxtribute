import { useReactiveVar } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { distinct, tidy } from "@tidyjs/tidy";
import DemographicCharts from "./DemographicCharts";
import { tagToFilterValue } from "../../filter/TagFilter";
import { tagFilterIncludedId, tagFilterExcludedId } from "../../filter/TabbedTagFilter";
import useTimerange from "../../../hooks/useTimerange";
import { filterListByInterval } from "../../../../utils/helpers";
import { tagFilterIncludedValuesVar, tagFilterExcludedValuesVar } from "../../../state/filter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { filterByTags } from "../../../utils/filterByTags";
import {
  BeneficiaryDemographics,
  BeneficiaryDemographicsResult,
} from "../../../../../graphql/types";

interface IDemographicFilterContainerProps {
  demographics: BeneficiaryDemographics;
}

export default function DemographicFilterContainer({
  demographics,
}: IDemographicFilterContainerProps) {
  const { interval } = useTimerange();

  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);
  const { includedFilterValue: includedTags, excludedFilterValue: excludedTags } =
    useMultiSelectFilter(
      includedTagFilterValues,
      tagFilterIncludedId,
      excludedTagFilterValues,
      tagFilterExcludedId,
    );

  // merge Beneficiary tags to Box and All tags
  useEffect(() => {
    const beneficiaryTagFilterValues = demographics?.dimensions!.tag!.map((e) =>
      tagToFilterValue(e!),
    );

    if (beneficiaryTagFilterValues?.length! > 0) {
      const distinctTagFilterValues = tidy(
        [...includedTagFilterValues, ...beneficiaryTagFilterValues!],
        distinct(["id"]),
      );

      // Populate the tag filter values for both included and excluded
      tagFilterIncludedValuesVar(distinctTagFilterValues);
      tagFilterExcludedValuesVar(distinctTagFilterValues);
    }
    // including tagFilterOptions in the dependencies can lead to infinite update loops
    // between CreatedBoxes updating the TagFilter and DemographicFilter updating the TagFilter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demographics?.dimensions]);

  const demographicFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (demographics?.facts as BeneficiaryDemographicsResult[]) ?? [],
        "createdOn",
        interval,
      ) as BeneficiaryDemographicsResult[];
    } catch {
      // TODO useError
    }
    return [];
  }, [demographics?.facts, interval]);

  const filteredFacts = useMemo(() => {
    // Apply tag filter (included/excluded)
    const filtered = filterByTags(demographicFacts, includedTags, excludedTags);

    return filtered;
  }, [demographicFacts, includedTags, excludedTags]);

  const demographicCube = {
    ...demographics,
    facts: filteredFacts as BeneficiaryDemographicsResult[],
  };

  return <DemographicCharts demographics={demographicCube} />;
}
