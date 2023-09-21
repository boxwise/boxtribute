import { Route, Routes } from "react-router-dom";
import DemographicView from "./views/Statistics/DemographicView";
import BoxView from "./views/Statistics/BoxView";
import ProductRankView from "./views/Statistics/ProductRankView";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="demographic" element={<DemographicView />} />
      <Route path="boxes" element={<BoxView />} />
      <Route path="product-rank" element={<ProductRankView />} />
    </Routes>
  );
}

export default App;
