import { useState } from "react";
import { Link } from "react-router-dom";
import { changePassword } from "../../services/authService";
import BrandLogo from "../../components/ui/BrandLogo";

function ChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await changePassword(formData.currentPassword, formData.newPassword);

      setSuccess(true);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Unable to change your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="rounded-sm bg-stone-950 px-2 py-1">
              <BrandLogo className="h-7 w-auto" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                A considered edit
              </p>
            </div>
          </Link>

        </div>
      </header>


      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="mb-8">

          <Link
            to="/account"
            className="text-sm text-slate-500 hover:text-green-700"
          >
            ← Back to Account
          </Link>

        </div>


        <div className="grid lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block">

            <div className="bg-white rounded-2xl border border-slate-200 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Account Settings
              </p>

              <nav className="space-y-1">

                <Link
                  to="/account"
                  className="block px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  Account Overview
                </Link>

                <Link
                  to="/account/profile"
                  className="block px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  Personal Information
                </Link>

                <Link
                  to="/account/orders"
                  className="block px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  My Orders
                </Link>

                <Link
                  to="/account/change-password"
                  className="block px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm"
                >
                  Change Password
                </Link>

              </nav>

            </div>

          </aside>


          {/* Main */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Title */}
              <div className="p-6 md:p-8 border-b border-slate-100">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-xl">
                    🔐
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Change Password
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Keep your account secure with a strong password.
                    </p>
                  </div>

                </div>

              </div>


              {/* Form */}
              <div className="p-6 md:p-8 max-w-2xl">

                {/* Error */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">

                    <span className="text-lg">
                      ⚠
                    </span>

                    <p>{error}</p>

                  </div>
                )}


                {/* Success */}
                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">

                    <span className="text-lg">
                      ✓
                    </span>

                    <div>
                      <p className="font-semibold">
                        Password changed successfully.
                      </p>

                      <p className="mt-1 text-green-600">
                        Your account password has been updated.
                      </p>
                    </div>

                  </div>
                )}


                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  {/* Current Password */}
                  <div>

                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Current password
                    </label>

                    <div className="relative">

                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        placeholder="Enter your current password"
                        className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showCurrent ? "🙈" : "👁"}
                      </button>

                    </div>

                    <div className="mt-2">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                      >
                        Forgot your current password?
                      </Link>
                    </div>

                  </div>


                  {/* New Password */}
                  <div>

                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      New password
                    </label>

                    <div className="relative">

                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Enter a new password"
                        className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showNew ? "🙈" : "👁"}
                      </button>

                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Use at least 8 characters.
                    </p>

                  </div>


                  {/* Confirm Password */}
                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Confirm new password
                    </label>

                    <div className="relative">

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Confirm your new password"
                        className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm(!showConfirm)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showConfirm ? "🙈" : "👁"}
                      </button>

                    </div>

                  </div>


                  {/* Password tips */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Password tips
                    </p>

                    <ul className="text-sm text-slate-500 space-y-1">
                      <li>• Use at least 8 characters.</li>
                      <li>• Avoid using easily guessed information.</li>
                      <li>• Don't reuse your password on other websites.</li>
                    </ul>

                  </div>


                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 px-6 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >

                      {loading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          Change Password
                          <span>→</span>
                        </>
                      )}

                    </button>


                    <Link
                      to="/account"
                      className="h-12 px-6 rounded-xl border border-slate-200 text-slate-700 font-semibold flex items-center justify-center hover:bg-slate-50 transition"
                    >
                      Cancel
                    </Link>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ChangePassword;