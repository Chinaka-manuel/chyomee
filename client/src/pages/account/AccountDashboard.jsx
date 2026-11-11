import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Package,
  LockKeyhole,
  Wallet,
  Coins,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogIn,
  Store,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { getMyOrders } from "../../services/orderService";
import { getCartSummary } from "../../services/cartService";
import {
  getCustomerAddresses,
  getCustomerProfile,
} from "../../services/customerService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import AccountNavigation from "./AccountNavigation";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  Pending: Clock3,
  Processing: Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};

const quickActions = [
  {
    to: "/shop",
    icon: Store,
    title: "Continue Shopping",
    description: "Discover new arrivals and everyday favourites.",
  },
  {
    to: "/account/orders",
    icon: Package,
    title: "Track an Order",
    description: "Check the status of your recent purchases.",
  },
  {
    to: "/account/change-password",
    icon: LockKeyhole,
    title: "Change Password",
    description: "Keep your account secure.",
  },
];

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const firstName = (name = "") => name.trim().split(/\s+/)[0] || "Customer";

const StatCard = ({ title, value, description, icon: Icon, link, state }) => (
  <Link
    to={link}
    state={state}
    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div className="flex items-start justify-between">
      <div className="rounded-xl bg-green-50 p-3 text-green-700">
        <Icon size={21} />
      </div>

      <ArrowRight
        size={18}
        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-green-600"
      />
    </div>

    <p className="mt-5 text-sm text-gray-500">{title}</p>

    <p className="mt-1 truncate text-2xl font-bold text-gray-900">{value}</p>

    <p className="mt-1 text-xs text-gray-400">{description}</p>
  </Link>
);

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />
);

const normalizeLoyaltyBalanceKobo = (profile = {}) => {
  const rawValue = profile?.loyaltyBalanceKobo ?? profile?.loyaltyBalance ?? 0;

  const numericValue = Number(rawValue) || 0;

  if (Object.prototype.hasOwnProperty.call(profile, "loyaltyBalanceKobo")) {
    return Math.max(0, Math.round(numericValue));
  }

  return Math.max(0, Math.round(numericValue * 100));
};

const AccountDashboard = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError("");
    setLoggingOut(true);
    try {
      await logout();
      navigate("/account/login", { replace: true });
    } catch (logoutFailure) {
      setLogoutError(
        logoutFailure.message || "Unable to log out. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
    const [ordersResult, cartResult, addressesResult, profileResult] =
      await Promise.allSettled([
        getMyOrders(),
        getCartSummary(),
        getCustomerAddresses(),
        getCustomerProfile(),
      ]);

    return {
      orders:
        ordersResult.status === "fulfilled"
          ? (ordersResult.value.data ?? [])
          : [],
      cart:
        cartResult.status === "fulfilled"
          ? (cartResult.value.data ?? { items: 0, subtotal: 0 })
          : { items: 0, subtotal: 0 },
      addresses:
        addressesResult.status === "fulfilled"
          ? (addressesResult.value.data ?? [])
          : [],
      loyaltyBalanceKobo:
        profileResult.status === "fulfilled"
          ? normalizeLoyaltyBalanceKobo(profileResult.value.data ?? {})
          : 0,
      failed:
        ordersResult.status === "rejected" ||
        profileResult.status === "rejected",
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    fetchDashboard().then((result) => {
      if (!active) return;

      setData(result);
      if (result.failed) {
        setError("We could not load your account data. Please try again.");
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, fetchDashboard]);

  const retry = useCallback(async () => {
    setError(null);
    setData(null);

    const result = await fetchDashboard();

    setData(result);
    if (result.failed) {
      setError("We could not load your account data. Please try again.");
    }
  }, [fetchDashboard]);

  const orderList = useMemo(() => data?.orders ?? [], [data]);

  const loyaltyBalanceKobo = Number(data?.loyaltyBalanceKobo ?? 0);

  const stats = useMemo(() => {
    const activeOrders = orderList.filter(
      (order) => order.status !== "Cancelled",
    );
    const totalSpent = activeOrders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0,
    );
    const pending = orderList.filter(
      (order) => order.status === "Pending" || order.status === "Processing",
    ).length;

    return [
      {
        title: "Total Orders",
        value: String(orderList.length),
        description: "Lifetime purchases",
        icon: ShoppingBag,
        link: "/account/orders",
      },
      {
        title: "Total Spent",
        value: formatCurrency(totalSpent),
        description: "Excluding cancelled orders",
        icon: Wallet,
        link: "/account/orders",
      },
      {
        title: "Loyalty Balance",
        value: formatCurrency(loyaltyBalanceKobo / 100),
        description: "Tap to apply at checkout (from ₦5,000)",
        icon: Coins,
        link: "/checkout",
        state: { redeemLoyalty: true },
      },
      {
        title: "Pending Orders",
        value: String(pending),
        description: "Needs attention",
        icon: AlertCircle,
        link: "/account/orders",
      },
    ];
  }, [loyaltyBalanceKobo, orderList]);

  const loading = isAuthenticated && data === null && !error;

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-linear-to-r from-green-800 to-green-600">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="animate-pulse rounded-2xl bg-white/10 p-6">
              <div className="h-4 w-28 rounded bg-white/20" />
              <div className="mt-4 h-9 w-72 rounded bg-white/20" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-linear-to-r from-green-800 to-green-600">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="mb-2 text-sm font-medium text-green-100">
              Customer Account
            </p>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Welcome
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <LogIn size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Sign in to view your dashboard
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Your orders, cart, profile and account settings are available
              after signing in.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/account/login"
                className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                <LogIn size={17} />
                Sign In
              </Link>

              <Link
                to="/account/register"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-r from-green-800 to-green-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-green-100">
                Customer Account
              </p>

              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Welcome back, {firstName(user?.userName)}
              </h1>

              <p className="mt-2 text-green-100">
                Manage your orders, profile and account from here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/account/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
              >
                <User size={18} />
                My Profile
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-700/40 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <Store size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountNavigation />

        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.userName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                    {initials(user?.userName) || "?"}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.userName || "Customer"}
                  </h2>

                  <p className="text-sm text-gray-500">{user?.email}</p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    {user?.phone && <span>{user.phone}</span>}
                    {user?.createdAt && (
                      <span>Member since {formatDate(user.createdAt)}</span>
                    )}
                    <span className="rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-700">
                      Customer
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/account/profile"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                Edit Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>

              <p className="mt-4 font-semibold text-red-700">{error}</p>

              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </section>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map(
                ({ title, value, description, icon: Icon, link, state }) => (
                  <StatCard
                    key={title}
                    title={title}
                    value={value}
                    description={description}
                    icon={Icon}
                    link={link}
                    state={state}
                  />
                ),
              )}
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Orders
                </h3>
                <p className="text-sm text-gray-500">
                  Check the latest updates on your purchases.
                </p>
              </div>

              <Link
                to="/account/orders"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!error && orderList.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                  You have no recent orders yet.
                </div>
              )}

              {!error &&
                orderList.length > 0 &&
                orderList.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.date || order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_ICONS[order.status]
                          ? (() => {
                              const Icon = STATUS_ICONS[order.status];
                              return <Icon size={14} />;
                            })()
                          : null}
                        {order.status}
                      </span>

                      <Link
                        to={`/account/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
                      >
                        Details
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Quick Actions
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map(({ to, icon: Icon, title, description }) => (
                  <Link
                    key={title}
                    to={to}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-green-200 hover:bg-green-50"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>

          {logoutError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {logoutError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountDashboard;
