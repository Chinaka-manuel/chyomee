import { Route, Routes } from "react-router-dom";
import AccountDashboard from "../pages/account/AccountDashboard";
import Profile from "../pages/account/Profile";
import MyOrders from "../pages/account/MyOrders";
import OrderDetails from "../pages/account/OrderDetails";
import Receipt from "../pages/account/Receipt";
import Login from "../pages/account/Login";
import Register from "../pages/account/Register";
import ChangePassword from "../pages/account/ChangePassword";
import SavedAddresses from "../pages/account/SavedAddresses";
import Favorites from "../pages/public/Favorites/Favorites";
import TailoringRequests from "../pages/account/TailoringRequests";

function AccountRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route index element={<AccountDashboard />} />
      <Route path="dashboard" element={<AccountDashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="orders" element={<MyOrders />} />
      <Route path="tailoring" element={<TailoringRequests />} />
      <Route path="wishlist" element={<Favorites />} />
      <Route path="orders/:orderId" element={<OrderDetails />} />
      <Route path="orders/:orderId/receipt" element={<Receipt />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="settings" element={<SavedAddresses />} />
      <Route path="saved-addresses" element={<SavedAddresses />} />
    </Routes>
  );
}

export default AccountRoutes;
