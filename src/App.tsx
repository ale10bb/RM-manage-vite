import { Routes, Route, Navigate } from "react-router-dom";

import { Auth, Unauthorized } from "./Auth";
import Manage from "./Manage";
import Dashboard from "./Dashboard";
import HistoryMain from "./History";

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Navigate to={"/auth"}></Navigate>} />
        <Route path="auth" element={<Auth />} />
        <Route path="403" element={<Unauthorized />} />
        <Route path="manage" element={<Manage />}>
          <Route
            index
            element={<Navigate to={"/manage/dashboard"}></Navigate>}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<HistoryMain />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
