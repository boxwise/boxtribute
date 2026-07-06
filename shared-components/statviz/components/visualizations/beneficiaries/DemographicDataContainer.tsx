import { useQuery } from "@apollo/client";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

import { DEMOGRAPHIC_QUERY } from "../../../queries/queries";
import DemographicFilterContainer from "./DemographicFilterContainer";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import NoDataCard from "../../NoDataCard";
import type { BeneficiaryAppliedFilters } from "../../../utils/dashboardFilters";

interface DemographicDataContainerProps {
  isActive: boolean;
  appliedFilters: BeneficiaryAppliedFilters;
}

export default function DemographicDataContainer({
  isActive,
  appliedFilters,
}: DemographicDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(DEMOGRAPHIC_QUERY, {
    variables: { baseId: parseInt(baseId!, 10) },
    skip: !isActive,
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
  return (
    <DemographicFilterContainer
      demographics={data.beneficiaryDemographics}
      appliedFilters={appliedFilters}
    />
  );
}
