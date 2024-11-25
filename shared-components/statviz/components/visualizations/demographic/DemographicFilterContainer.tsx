import { useReactiveVar } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { TidyFn, distinct, filter, tidy } from "@tidyjs/tidy";
import DemographicCharts from "./DemographicCharts";
import { tagFilterId, tagToFilterValue } from "../../filter/TagFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import useTimerange from "../../../hooks/useTimerange";
import { filterListByInterval } from "../../../../utils/helpers";
import { tagFilterValuesVar } from "../../../state/filter";

interface IDemographicFilterContainerProps {
  demographics: BeneficiaryDemographicsData;
}

export default function DemographicFilterContainer({
  demographics,
}: IDemographicFilterContainerProps) {
  const { interval } = useTimerange();

  const tagFilterValues = useReactiveVar(tagFilterValuesVar);
  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilterValues, tagFilterId);

  // merge Beneficiary tags to Box and All tags
  useEffect(() => {
    const beneficiaryTagFilterValues = demographics.dimensions!.tag!.map((e) =>
      tagToFilterValue(e!),
    );

    if (beneficiaryTagFilterValues.length > 0) {
      const distinctTagFilterValues = tidy(
        [...tagFilterValues, ...beneficiaryTagFilterValues],
        distinct(["id"]),
      );

      tagFilterValuesVar(distinctTagFilterValues);
    }
    // including tagFilterOptions in the dependencies can lead to infinite update loops
    // between CreatedBoxes updating the TagFilter and DemographicFilter updating the TagFilter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demographics.dimensions]);

  const demographicFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (demographics.facts as BeneficiaryDemographicsResult[]) ?? [],
        "createdOn",
        interval,
      ) as BeneficiaryDemographicsResult[];
    } catch (error) {
      // TODO useError
    }
    return [];
  }, [demographics.facts, interval]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (filteredTags.length > 0) {
      filters.push(
        filter((fact: BeneficiaryDemographicsResult) =>
          filteredTags.some((fT) => fact.tagIds!.includes(fT.id)),
        ),
      );
    }

    if (filters.length > 0) {
      // @ts-expect-error
      return tidy(demographicFacts, ...filters);
    }
    return demographicFacts;
  }, [demographicFacts, filteredTags]);

  const demographicCube = {
    ...demographics,
    facts: filteredFacts,
  };

  return <DemographicCharts demographics={demographicCube} />;
}
