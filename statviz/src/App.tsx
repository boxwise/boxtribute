import { gql, useQuery } from "@apollo/client";
import { Route, Routes } from "react-router-dom";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
} from "./types/generated/graphql";

function App() {
  const { data } = useQuery<
    BeneficiaryDemographicsQuery,
    BeneficiaryDemographicsQueryVariables
  >(
    gql`
      query BeneficiaryDemographics {
        beneficiaryDemographics {
          age
          gender
          createdOn
          count
        }
      }
    `
  );
  console.log(data);
  return (
    <Routes>
      <Route index />
    </Routes>
  );
}

export default App;
