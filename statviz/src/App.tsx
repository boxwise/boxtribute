import { Route, Routes } from "react-router-dom";
import StatisticsView from "./views/Statistics/StatisticsView";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="demographic" element={<StatisticsView />} />
    </Routes>
  );
}

export default App;
