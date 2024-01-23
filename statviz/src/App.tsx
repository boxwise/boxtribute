import { Route, Routes } from "react-router-dom";
import Dashboard from "./views/Dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route index />
      <Route path="bases">
        <Route path=":baseId">
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
