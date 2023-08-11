import { gql, useQuery } from "@apollo/client";
import { Route, Routes } from "react-router-dom";
import DemographicChart from "./views/Statistics/components/DemographicChart";

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
      <Route path="stats">
        <Route path="demographic" element={<DemographicChart />} />
      </Route>
    </Routes>
  );
}

export default App;
