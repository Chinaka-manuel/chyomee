import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { fashionImages } from "../../data/fashionImages";
import BrandLogo from "../../components/ui/BrandLogo";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
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

    setError("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      formData.password.length < 8 ||
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !/[^A-Za-z0-9]/.test(formData.password)
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase and lowercase letters, a number, and a symbol.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        userName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
      });
      navigate("/account/login", {
        state: {
          message:
            response.message ||
            (response.data?.isVerified
              ? "Account created successfully. You can now sign in."
              : "Account created successfully. Please verify your email before signing in."),
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* =====================================================
          LEFT SIDE - BRAND
      ====================================================== */}

      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-900">
        <img
          src={fashionImages[1]}
          alt="A fashion collection in a city setting"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center w-fit">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          {/* Main message */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-green-100 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Join our community
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Find pieces you love,
              <span className="block text-green-300">make them your own.</span>
            </h2>

            <p className="text-green-100 text-lg leading-8 max-w-lg">
              Create your chyomee account for an easier way to shop, track
              orders, and save the pieces you love.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mt-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  🛒
                </div>

                <div>
                  <p className="font-semibold">Easy shopping</p>

                  <p className="text-sm text-green-200">
                    Save your details for faster checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  📦
                </div>

                <div>
                  <p className="font-semibold">Track your orders</p>

                  <p className="text-sm text-green-200">
                    Follow your order from checkout to delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  ✨
                </div>

                <div>
                  <p className="font-semibold">Discover fresh products</p>

                  <p className="text-sm text-green-200">
                    Discover new arrivals and style inspiration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-green-200">
            © {new Date().getFullYear()} chyomee
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHT SIDE - REGISTER FORM
      ====================================================== */}

      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
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
          <div className="mb-7">
            <p className="text-sm font-semibold text-green-700 mb-2">
              GET STARTED
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="text-slate-500 mt-3">
              Join chyomee and discover fashion and accessories selected for
              everyday style.
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                <span className="text-lg">⚠</span>

                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    First name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    autoComplete="given-name"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Last name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />
                </div>
              </div>

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
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Phone number
                  <span className="font-normal text-slate-400"> Optional</span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ☎
                  </span>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    autoComplete="tel"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Password
                </label>

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
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters, including uppercase and lowercase
                  letters, a number, and a symbol.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                />

                <label
                  htmlFor="terms"
                  className="text-sm text-slate-500 leading-5"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-green-700 hover:text-green-800"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-green-700 hover:text-green-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-green-700 text-white font-semibold transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
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

            {/* Login */}
            <div className="text-center mt-7">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-green-700 hover:text-green-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Back */}
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

export default Register;
