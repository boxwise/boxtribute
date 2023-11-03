import { ApolloError, gql, useQuery } from "@apollo/client";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
} from "../../types/generated/graphql";
import DemographicChart from "./components/DemographicChart";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";

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

export default function DemographicView(params: {
  width: number;
  height: number;
}) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    BeneficiaryDemographicsQuery,
    BeneficiaryDemographicsQueryVariables
  >(DEMOGRAPHIC_QUERY, { variables: { baseIds: [parseInt(baseId)] } });

  if (error instanceof ApolloError) {
    return <p>ApolloError: {error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <DemographicChart
      cube={data.beneficiaryDemographics}
      width={params.width}
      height={params.height}
    />
  );
}
