import { useQuery } from "@apollo/client";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import NoDataCard from "../../NoDataCard";
import BeneficiaryReachChart from "./BeneficiaryReachChart";
import { BENEFICIARY_REACH_QUERY } from "../../../queries/queries";
import type { BeneficiaryAppliedFilters } from "../../../utils/dashboardFilters";

interface BeneficiaryReachDataContainerProps {
  isActive: boolean;
  appliedFilters: BeneficiaryAppliedFilters;
}

export default function BeneficiaryReachDataContainer({
  isActive,
  appliedFilters,
}: BeneficiaryReachDataContainerProps) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(BENEFICIARY_REACH_QUERY, {
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
  if (!data.beneficiaryReach || data.beneficiaryReach.facts.length === 0) {
    return (
      <NoDataCard
        header="Beneficiaries Reached over Time"
        message="No beneficiary reach data available."
      />
    );
  }
  return (
    <BeneficiaryReachChart reachData={data.beneficiaryReach} appliedFilters={appliedFilters} />
  );
}
