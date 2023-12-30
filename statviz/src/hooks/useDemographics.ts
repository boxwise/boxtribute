/* eslint-disable */
// TODO: refactoring
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { BeneficiaryDemographicsResult } from "../types/generated/graphql";
import useTimerange from "./useTimerange";

const DEMOGRAPHIC_QUERY = gql`
  query BeneficiaryDemographics($baseIds: [Int!]!) {
    beneficiaryDemographics(baseIds: $baseIds) {
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
`;

export default function useDemographics() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(DEMOGRAPHIC_QUERY, {
    variables: { baseIds: [parseInt(baseId)] },
  });

  const { timerange, interval } = useTimerange();

  return {
    demographics: useMemo(() => {
      if (!data) return demographicTable([]);

      const demographicFacts = demographicTable(
        data.beneficiaryDemographics.facts as BeneficiaryDemographicsResult[],
      );

      try {
        return demographicFacts.filterCreatedOn(interval);
      } catch (error) {
        console.log("invalid timerange in use demographics");
      }
    }, [data, interval]),
    data,
    loading,
    error,
    timerange,
  };
}
