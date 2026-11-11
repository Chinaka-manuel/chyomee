import { Route, Routes } from "react-router-dom";
import Home from "../pages/public/Home/Home";
import Shop from "../pages/public/Shop/Shop";
import ProductDetails from "../pages/public/ProductDetails/ProductDetails";
import Cart from "../pages/public/Cart/Cart";
import About from "../pages/public/About/About";
import OurCompany from "../pages/public/About/OurCompany";
import Governance from "../pages/public/About/Governance";
import BoardOfDirectors from "../pages/public/About/BoardOfDirectors";
import ManagementTeam from "../pages/public/About/ManagementTeam";
import Blog from "../pages/public/Blog/Blog";
import BlogArticle from "../pages/public/Blog/BlogArticle";
import BlogCategory from "../pages/public/Blog/BlogCategory";
import Contact from "../pages/public/Contact/Contact";
import FAQ from "../pages/public/FAQ/FAQ";
import Categories from "../pages/public/Categories/Categories";
import CategoryProduct from "../pages/public/Categories/CategoryProduct";
import Checkout from "../pages/public/Checkout/Checkout";
import OrderConfirmation from "../pages/public/Checkout/OrderConfirmation";
import Payment from "../pages/public/Checkout/Payment";
import PaymentSuccess from "../pages/public/Payment/PaymentSuccess";
import PaymentFailed from "../pages/public/Payment/PaymentFailed";
import PaymentCancelled from "../pages/public/Payment/PaymentCancelled";
import FarmerTraining from "../pages/public/Training/FarmerTraining";
import AgriculturalCourses from "../pages/public/Training/AgriculturalCourses";
import OnlineCourses from "../pages/public/Training/OnlineCourse";
import InPersonTraining from "../pages/public/Training/InPersonCourse";
import Workshops from "../pages/public/Training/Workshops";
import Login from "../pages/account/Login";
import Register from "../pages/account/Register";
import ForgotPassword from "../pages/account/ForgotPassword";
import ChangePassword from "../pages/account/ChangePassword";
import MyOrders from "../pages/account/MyOrders";
import SavedAddresses from "../pages/account/SavedAddresses";
import AccountDashboard from "../pages/account/AccountDashboard";
import Profile from "../pages/account/Profile";
import OrderDetails from "../pages/account/OrderDetails";
import ResetPassword from "../pages/account/ResetPassword";
import Favorites from "../pages/public/Favorites/Favorites";
import WriteReview from "../pages/public/WriteReview";
import Reviews from "../pages/public/Reviews";
import PrivacyPolicy from "../pages/public/Legal/PrivacyPolicy";
import TermsAndConditions from "../pages/public/Legal/TermsAndConditions";

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/write-review" element={<WriteReview />} />
      <Route path="/WriteReview" element={<WriteReview />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/Shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/ProductDetails" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/Cart" element={<Cart />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/Favorites" element={<Favorites />} />
      <Route path="/about" element={<About />} />
      <Route path="/About" element={<About />} />
      <Route path="/company" element={<OurCompany />} />
      <Route path="/OurCompany" element={<OurCompany />} />
      <Route path="/about/company" element={<OurCompany />} />
      <Route path="/about/governance" element={<Governance />} />
      <Route path="/Governance" element={<Governance />} />
      <Route path="/about/board-of-directors" element={<BoardOfDirectors />} />
      <Route path="/BoardOfDirectors" element={<BoardOfDirectors />} />
      <Route path="/about/management-team" element={<ManagementTeam />} />
      <Route path="/ManagementTeam" element={<ManagementTeam />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/Blog" element={<Blog />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/blog/:slug" element={<BlogArticle />} />
      <Route path="/blog/article/:id" element={<BlogArticle />} />
      <Route path="/BlogArticle" element={<BlogArticle />} />
      <Route path="/blog/category/:slug" element={<BlogCategory />} />
      <Route path="/BlogCategory" element={<BlogCategory />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/Contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/Terms" element={<TermsAndConditions />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/FAQ" element={<FAQ />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/Categories" element={<Categories />} />
      <Route path="/categories/:slug" element={<CategoryProduct />} />
      <Route path="/CategoryProduct" element={<CategoryProduct />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/Checkout" element={<Checkout />} />
      <Route
        path="/checkout/order-confirmation"
        element={<OrderConfirmation />}
      />
      <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
      <Route path="/checkout/payment" element={<Payment />} />
      <Route path="/Payment" element={<Payment />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/PaymentFailed" element={<PaymentFailed />} />
      <Route path="/payment/cancelled" element={<PaymentCancelled />} />
      <Route path="/PaymentCancelled" element={<PaymentCancelled />} />
      <Route path="/training" element={<AgriculturalCourses />} />
      <Route path="/AgriculturalCourses" element={<AgriculturalCourses />} />
      <Route path="/training/farmer-training" element={<FarmerTraining />} />
      <Route path="/FarmerTraining" element={<FarmerTraining />} />
      <Route path="/training/courses/online" element={<OnlineCourses />} />
      <Route path="/OnlineCourses" element={<OnlineCourses />} />
      <Route
        path="/training/courses/in-person"
        element={<InPersonTraining />}
      />
      <Route path="/InPersonTraining" element={<InPersonTraining />} />
      <Route path="/training/workshops" element={<Workshops />} />
      <Route path="/Workshops" element={<Workshops />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />
      <Route path="/changePassword" element={<ChangePassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/ChangePassword" element={<ChangePassword />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/MyOrders" element={<MyOrders />} />
      <Route path="/account" element={<AccountDashboard />} />
      <Route path="/AccountDashboard" element={<AccountDashboard />} />
      <Route path="/account/profile" element={<Profile />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/account/orders" element={<MyOrders />} />
      <Route path="/account/settings" element={<SavedAddresses />} />
      <Route path="/account/saved-addresses" element={<SavedAddresses />} />
      <Route path="/SavedAddresses" element={<SavedAddresses />} />
      <Route path="/account/orders/:orderId" element={<OrderDetails />} />
      <Route path="/OrderDetails" element={<OrderDetails />} />
    </Routes>
  );
}

export default PublicRoutes;
