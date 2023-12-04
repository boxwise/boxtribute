import { Route, Routes } from "react-router-dom";
import DemographicView from "./views/Statistics/DemographicView";
import Dashboard from "./views/Dashboard/Dashboard";
import CreatedBoxes from "./components/visualizations/CreatedBoxes/CreatedBoxes";
import TopCreatedProducts from "./components/visualizations/CreatedBoxes/TopCreatedProducts";
import DemographicChart from "./components/visualizations/Demographic/DemographicPyramid";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="bases">
        <Route path=":baseId">
          <Route index element={<Dashboard />} />
          <Route
            path="created-boxes"
            element={<CreatedBoxes width="800px" height="800px" />}
          />
          <Route
            path="product-rank"
            element={<TopCreatedProducts width="800px" height="800px" />}
          />
          <Route path="demographic" element={<DemographicChart />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
