import { gql, useQuery } from "@apollo/client";
import { Route, Routes } from "react-router-dom";

function App() {
  const { data } = useQuery(
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
