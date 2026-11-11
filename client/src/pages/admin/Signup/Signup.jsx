import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../../../services/api";
import BrandLogo from "../../../components/ui/BrandLogo";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    passcode: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await post("/admin/signup", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        passcode: formData.passcode,
      });

      alert(response.message || "Admin account created successfully!");
      navigate("/admin/AdminLogin");
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-lg sm:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex rounded-sm bg-stone-950 px-3 py-2">
            <BrandLogo className="h-[100px] w-[100px]" />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Create an administrator account
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A4329] focus:ring-2 focus:ring-[#1A4329]/20"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A4329] focus:ring-2 focus:ring-[#1A4329]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-[#1A4329] focus:ring-2 focus:ring-[#1A4329]/20"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#1A4329]"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.5 12c1.95 3.4 5.25 5.5 10.5 5.5s8.55-2.1 10.5-5.5a10.477 10.477 0 0 0-2.48-3.777M9.88 9.88a3 3 0 1 0 4.24 4.24M6.61 6.61 17.39 17.39"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.01 9.963 7.183a1.012 1.012 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.01-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A4329] focus:ring-2 focus:ring-[#1A4329]/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passcode"
              className="block text-sm font-medium text-gray-700"
            >
              Admin Passcode
            </label>
            <input
              type="password"
              id="passcode"
              name="passcode"
              value={formData.passcode}
              onChange={handleChange}
              placeholder="Enter admin passcode"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#1A4329] focus:ring-2 focus:ring-[#1A4329]/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1A4329] px-4 py-3 font-semibold text-white transition hover:bg-[#143521] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/admin/AdminLogin"
            className="font-semibold text-[#1A4329] hover:underline"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
