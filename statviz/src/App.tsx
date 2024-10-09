import { Route, Routes } from "react-router-dom";
import Dashboard from "@boxtribute/shared-components/statviz/dashboard/Dashboard";

// test precommit
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
