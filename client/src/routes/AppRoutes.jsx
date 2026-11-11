import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AccountRoutes from "./AccountRoutes";
import AdminRoutes from "./AdminRoutes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/account/*" element={<AccountRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<PublicRoutes />} />
    </Routes>
  );
}

export default AppRoutes;
