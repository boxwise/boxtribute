import { Route, Routes } from "react-router-dom";
import DemographicView from "./views/Statistics/DemographicView";
import Dashboard from "./views/Dashboard/Dashboard";
import CreatedBoxes from "./views/Statistics/components/CreatedBoxes";
import TopProducts from "./views/Statistics/components/TopProducts";

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
            element={<TopProducts width="800px" height="800px" />}
          />
          <Route path="demographic" element={<DemographicView />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
