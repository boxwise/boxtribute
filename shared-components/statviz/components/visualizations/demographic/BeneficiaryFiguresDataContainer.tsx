import { useQuery } from "@apollo/client";
import { Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ErrorCard, { predefinedErrors } from "../../ErrorCard";
import BeneficiaryFiguresCards from "./BeneficiaryFiguresCards";
import { BENEFICIARY_FIGURES_QUERY } from "../../../queries/queries";

export default function BeneficiaryFiguresDataContainer() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(BENEFICIARY_FIGURES_QUERY, {
    variables: { baseId: baseId! },
  });

  if (error) {
    return <ErrorCard error={error.message} />;
  }
  if (loading) {
    return <Spinner />;
  }
  if (data === undefined || data.beneficiaryFigures === null) {
    return <ErrorCard error={predefinedErrors.noData} />;
  }
  return <BeneficiaryFiguresCards figures={data.beneficiaryFigures!} />;
}
