import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerProfile } from "../../services/customerService";
import AccountNavigation from "./AccountNavigation";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

const splitUserName = (name = "") => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const buildProfileFromUser = (user = {}) => {
  const userName = typeof user.userName === "string" ? user.userName : "";
  const { firstName, lastName } = splitUserName(userName);

  return {
    firstName,
    lastName,
    email: user.email || "",
    phone: user.phone || "",
    address: "",
    city: "",
    state: "",
  };
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!active) return;

      setError("");
      setLoading(true);

      try {
        const { data } = await getCustomerProfile();
        const nextProfile = buildProfileFromUser(data ?? {});
        if (active) {
          setProfile(nextProfile);
        }
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError?.message || "Unable to load your profile right now.",
        );
        setProfile(emptyProfile);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const profileName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="transition hover:text-green-700">
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-700">Profile</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information and account details.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
                {profileName
                  ? profileName
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("") || "?"
                  : "?"}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                {profileName || "Customer"}
              </h2>

              <p className="text-sm text-slate-500">Customer</p>
            </div>

            <nav className="space-y-2">
              <Link
                to="/account"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
              >
                Dashboard
              </Link>

              <Link
                to="/account/profile"
                className="block rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
              >
                Profile
              </Link>

              <Link
                to="/account/orders"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
              >
                My Orders
              </Link>

              <Link
                to="/account/wishlist"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
              >
                Wishlist
              </Link>
            </nav>
          </aside>

          <section className="lg:col-span-3">
            <AccountNavigation />

            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 border-b border-slate-200 pb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your personal details from your account.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                  <div className="h-12 animate-pulse rounded-lg bg-slate-200" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        value={profile.firstName}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        value={profile.lastName}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={profile.phone || "Not available"}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Profile;
