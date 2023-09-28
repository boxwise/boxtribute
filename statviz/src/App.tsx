import { Route, Routes } from "react-router-dom";
import DemographicView from "./views/Statistics/DemographicView";
import BoxView from "./views/Statistics/BoxView";
import ProductRankView from "./views/Statistics/TopProductsView";
import Dashboard from "./views/Statistics/Dashboard";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="demographic" element={<DemographicView />} />
      <Route path="boxes" element={<BoxView />} />
      <Route path="product-rank" element={<ProductRankView />} />
      <Route path="dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
