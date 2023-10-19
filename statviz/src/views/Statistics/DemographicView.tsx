import { ApolloError, gql, useQuery } from "@apollo/client";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
  BeneficiaryDemographicsResult,
} from "../../types/generated/graphql";
import DemographicChart, {
  IDemographicCube,
} from "./components/DemographicChart";
import { table } from "../../utils/table";
import { beneficiaryDemographicsMock } from "../../mocks/demographic";
import _ from "lodash";

const DEMOGRAPHIC_QUERY = gql`
  query BeneficiaryDemographics {
    beneficiaryDemographics(baseIds: [11]) {
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

export default function DemographicView() {
  const { data, loading, error } = useQuery<
    BeneficiaryDemographicsQuery,
    BeneficiaryDemographicsQueryVariables
  >(DEMOGRAPHIC_QUERY);

  if (error instanceof ApolloError) {
    return <p>ApolloError: {error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  return <DemographicChart cube={data.beneficiaryDemographics} />;
}
