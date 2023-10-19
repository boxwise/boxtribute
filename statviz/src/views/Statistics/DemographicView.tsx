import { ApolloError, gql, useQuery } from "@apollo/client";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
} from "../../types/generated/graphql";
import DemographicChart, {
  IDemographicCube,
} from "./components/DemographicChart";

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

  console.log(data);

  const cube: IDemographicCube = {
    ...data.beneficiaryDemographics,
    facts: data.beneficiaryDemographics.facts
      .map((e) => ({
        ...e,
        createdOn: new Date(e.createdOn),
      }))
      .filter((e) => e.age < 120),
  };

  return <DemographicChart cube={cube} />;
}
