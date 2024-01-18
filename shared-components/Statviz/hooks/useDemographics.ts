import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { gql } from "../../types/generated/gql";
import { BeneficiaryDemographicsResult } from "../../types/generated/graphql";
import useTimerange from "./useTimerange";
import { filterListByInterval } from "../utils/helpers";

const DEMOGRAPHIC_QUERY = gql(`
  query BeneficiaryDemographics($baseId: Int!) {
    beneficiaryDemographics(baseId: $baseId) {
      facts {
        count
        createdOn
        age
        gender
      }
      dimensions {
        tag {
          name
          id
        }
      }
    }
  }
`);

export default function useDemographics() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(DEMOGRAPHIC_QUERY, {
    variables: { baseId: parseInt(baseId ?? "", 10) },
  });

  const { timerange, interval } = useTimerange();

  return {
    demographics: useMemo(() => {
      if (!data) return [];

      const demographicFacts = data.beneficiaryDemographics
        ?.facts as BeneficiaryDemographicsResult[];

      try {
        return filterListByInterval(demographicFacts, "createdOn", interval);
      } catch (intervalFilterError) {
        // TODO show toast with error message?
      }
      return [];
    }, [data, interval]),
    data,
    loading,
    error,
    timerange,
  };
}
