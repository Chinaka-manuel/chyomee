import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/useAuth";
import { fashionImages } from "../../data/fashionImages";
import BrandLogo from "../../components/ui/BrandLogo";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: sessionLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sessionLoading) return;

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);
      login(response);
      navigate(location.state?.from || "/account/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* =====================================================
          LEFT SIDE - BRAND VISUAL
      ====================================================== */}

      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-900">
        {/* Background image */}
        <img
          src={fashionImages[0]}
          alt="A fashion collection in a city setting"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-green-950/70" />

        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/50 to-green-950/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center w-fit">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          {/* Main message */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-green-100 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              FIND YOUR NEXT FAVOURITE
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Great style starts
              <span className="block text-green-300">with pieces you love.</span>
            </h2>

            <p className="text-green-100 text-lg leading-8 max-w-lg">
              Welcome back to chyomee. Discover fashion and accessories
              selected to make everyday dressing feel personal.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-2xl mb-2">🛍️</div>

                <p className="font-semibold">                A considered collection</p>

                <p className="text-sm text-green-200 mt-1">
                  Fashion and finishing touches
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="text-2xl mb-2">🚚</div>

                <p className="font-semibold">Easy Delivery</p>

                <p className="text-sm text-green-200 mt-1">
                  Delivered with care
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-sm text-green-200">
            © {new Date().getFullYear()} chyomee
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHT SIDE - LOGIN FORM
      ====================================================== */}

      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-sm bg-stone-950 px-2 py-1">
                <BrandLogo className="h-7 w-auto" />
              </div>

              <div>
                <p className="text-xs text-slate-500">A considered edit</p>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-green-700 mb-3">
              WELCOME BACK
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Sign in to your account
            </h2>

            <p className="text-slate-500 mt-3">
              Access your orders, saved products and account details.
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
            {location.state?.message && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-800" role="status">
                <span className="text-lg">✓</span>
                <p>{location.state.message}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                <span className="text-lg">⚠</span>

                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email address
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ✉
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                  />

                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || sessionLoading}
                className="w-full h-12 rounded-xl bg-green-700 text-white font-semibold transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sessionLoading ? (
                  "Checking session…"
                ) : loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-slate-400">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="font-bold">G</span>
                Google
              </button>

              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="font-bold">f</span>
                Facebook
              </button>
            </div>

            {/* Register */}
            <div className="text-center mt-7">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Back to website */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-green-700 transition"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
