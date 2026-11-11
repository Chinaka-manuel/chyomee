import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import PwaExperience from "./components/PwaExperience";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

function App() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const showPublicLayout = !isAdminRoute;

  return (
    <>
      <ScrollToTop />
      <PwaExperience />

      <div
        className={`flex min-h-screen flex-col ${
          showPublicLayout ? "public-store" : ""
        }`}
      >
        {showPublicLayout && <Header />}

        {showPublicLayout ? (
          <motion.main
            key={location.pathname}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
            className="flex-1"
          >
            <AppRoutes />
          </motion.main>
        ) : (
          <main className="flex-1">
            <AppRoutes />
          </main>
        )}

        {showPublicLayout && <Footer />}
      </div>
    </>
  );
}

export default App;
