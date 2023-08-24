import { Route, Routes } from "react-router-dom";
import DemographicView from "./views/Statistics/DemographicView";
import BoxView from "./views/Statistics/BoxView";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="demographic" element={<DemographicView />} />
      <Route path="boxes" element={<BoxView />} />
    </Routes>
  );
}

export default App;
