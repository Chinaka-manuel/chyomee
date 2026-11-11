import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { fashionImages } from "../../data/fashionImages";
import BrandLogo from "../../components/ui/BrandLogo";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* LEFT SIDE */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-green-900">
        <img
          src={fashionImages[2]}
          alt="A fashion collection in a city setting"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center w-fit">
            <BrandLogo className="h-9 w-auto" />
          </Link>

          {/* Message */}
          <div className="max-w-lg">
            <div className="text-5xl mb-6">🔐</div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              We'll help you
              <span className="block text-green-300">get back in.</span>
            </h2>

            <p className="text-green-100 text-lg leading-8">
              Don't worry if you've forgotten your password. Enter your email
              address and we'll help you regain access to your chyomee
              account.
            </p>
          </div>

          <p className="text-sm text-green-200">
            © {new Date().getFullYear()} chyomee
          </p>
        </div>
      </section>

      {/* RIGHT SIDE */}
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
              ACCOUNT RECOVERY
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Forgot your password?
            </h2>

            <p className="text-slate-500 mt-3 leading-6">
              Enter the email address associated with your account and we'll
              send you a password reset link.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
            {!submitted ? (
              <>
                {/* Error */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                    <span className="text-lg">⚠</span>

                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 focus:bg-white"
                      />
                    </div>
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
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* SUCCESS STATE */
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  Check your email
                </h3>

                <p className="text-slate-500 leading-6">
                  If an account exists for{" "}
                  <span className="font-semibold text-slate-700">{email}</span>,
                  we've sent instructions to reset your password.
                </p>

                <p className="text-sm text-slate-400 mt-4">
                  Don't see the email? Check your spam or junk folder.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-semibold text-green-700 hover:text-green-800"
                >
                  Try another email
                </button>
              </div>
            )}

            {/* Back to login */}
            <div className="border-t border-slate-100 mt-7 pt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-700 transition"
              >
                ← Back to login
              </Link>
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

export default ForgotPassword;
