import { gql, useQuery } from "@apollo/client";
import { Route, Routes } from "react-router-dom";
import DemographicChart from "./views/Statistics/components/DemographicChart";
import {
  BeneficiaryDemographicsQuery,
  BeneficiaryDemographicsQueryVariables,
} from "./types/generated/graphql";

function App() {
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
