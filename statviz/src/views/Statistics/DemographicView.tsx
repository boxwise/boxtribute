import { ApolloError, gql, useQuery } from "@apollo/client";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
  HumanGender,
} from "../../types/generated/graphql";
import DemographicChart, {
  IDemographicCube,
  IDemographicFact,
} from "./components/DemographicChart";

const DEMOGRAPHIC_QUERY = gql`
  query BeneficiaryDemographics {
    beneficiaryDemographics {
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
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const cube: IDemographicCube = {
    ...data.beneficiaryDemographics,
    facts: data.beneficiaryDemographics.facts.map((e) => ({
      ...e,
      createdOn: new Date(e.createdOn),
    })),
  };

  return <DemographicChart cube={cube} />;
}