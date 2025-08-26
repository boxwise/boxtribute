import { useQuery } from '@apollo/client/react';
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

import { graphql } from "../../../../../graphql/graphql";
import DemographicFilterContainer from "./DemographicFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import NoDataCard from "../../NoDataCard";

export const DEMOGRAPHIC_QUERY = graphql(`
  query BeneficiaryDemographics($baseId: Int!) {
    beneficiaryDemographics(baseId: $baseId) {
      facts {
        count
        createdOn
        age
        gender
        tagIds
      }
      dimensions {
        tag {
          id
          name
          color
        }
      }
    }
  }
`);

export default function DemographicDataContainer() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(DEMOGRAPHIC_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
  });

  if (error) {
    return <ErrorCard error={error.message} />;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  if (data.beneficiaryDemographics?.facts?.length === 0) {
    return (
      <NoDataCard
        header="Demographics"
        message="No demographics available. Either you are a sending base or don't have birth dates registered"
      />
    );
  }
  return <DemographicFilterContainer demographics={data.beneficiaryDemographics} />;
}
