import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Wallet,
  Users,
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserPlus,
  FileText,
  ArrowRight,
  Plus,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import { getAdminDashboard } from "../../../services/adminService";
import { useAdmin } from "../../../context/useAdmin";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />
);

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAdminDashboard()
      .then(({ data }) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const retry = useCallback(() => {
    setError("");

    getAdminDashboard()
      .then(({ data }) => setDashboard(data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const firstName = (name = "") => name.trim().split(/\s+/)[0] || "Admin";

  const mainStats = dashboard
    ? [
        {
          title: "Total Orders",
          value: dashboard.orders.toLocaleString(),
          description: "All customer orders",
          icon: ShoppingBag,
          link: "/admin/orders",
        },
        {
          title: "Revenue",
          value: formatCurrency(dashboard.revenue),
          description: "Excluding cancelled orders",
          icon: Wallet,
          link: "/admin/orders",
        },
        {
          title: "Customers",
          value: dashboard.customers.toLocaleString(),
          description: "Registered shoppers",
          icon: Users,
          link: "/admin/customers",
        },
        {
          title: "Products",
          value: dashboard.products.toLocaleString(),
          description: "Catalog entries",
          icon: Package,
          link: "/admin/products",
        },
      ]
    : [];

  const statusStats = dashboard
    ? [
        {
          title: "Pending",
          value: dashboard.orderStatus.Pending,
          icon: Clock3,
          className: "bg-amber-50 text-amber-700",
        },
        {
          title: "Processing",
          value: dashboard.orderStatus.Processing,
          icon: Truck,
          className: "bg-blue-50 text-blue-700",
        },
        {
          title: "Delivered",
          value: dashboard.orderStatus.Delivered,
          icon: CheckCircle2,
          className: "bg-green-50 text-green-700",
        },
        {
          title: "Cancelled",
          value: dashboard.orderStatus.Cancelled,
          icon: XCircle,
          className: "bg-red-50 text-red-700",
        },
      ]
    : [];

  const overview = dashboard
    ? [
        {
          title: "Pending Orders",
          value: dashboard.orderStatus.Pending,
          description: "Awaiting fulfilment",
          icon: Clock3,
          link: "/admin/orders",
        },
        {
          title: "Low Stock Products",
          value: dashboard.lowStock,
          description: "Fewer than 10 units",
          icon: AlertTriangle,
          link: "/admin/products",
        },
        {
          title: "New Customers",
          value: dashboard.newCustomers,
          description: "Last 30 days",
          icon: UserPlus,
          link: "/admin/customers",
        },
        {
          title: "Blog Posts",
          value: dashboard.blogPosts,
          description: "Published articles",
          icon: FileText,
          link: "/admin/blog",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-800 to-green-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-green-100">
                <LayoutDashboard size={16} />
                Administrator
              </p>

              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Welcome back, {firstName(admin?.userName)}
              </h1>

              <p className="mt-2 text-green-100">
                Here is what is happening across your store today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/products/add"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
              >
                <Plus size={18} />
                Add Product
              </Link>

              <Link
                to="/admin/orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-700/40 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                View Orders
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
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
        )}

        {!dashboard && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-80 lg:col-span-2" />
              <Skeleton className="h-80" />
            </div>
          </>
        )}

        {dashboard && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {mainStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Link
                    key={stat.title}
                    to={stat.link}
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

                    <p className="mt-5 text-sm text-gray-500">{stat.title}</p>

                    <p className="mt-1 truncate text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {stat.description}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statusStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.className}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>

                      <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Latest customer orders
                    </p>
                  </div>

                  <Link
                    to="/admin/orders"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800"
                  >
                    View All
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {dashboard.recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {dashboard.recentOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <Link
                                to={`/admin/orders/${order.id}`}
                                className="text-sm font-semibold text-green-700 hover:text-green-800"
                              >
                                #{order.id.slice(-6).toUpperCase()}
                              </Link>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-700">
                              {order.customer || "—"}
                            </td>

                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {formatCurrency(order.amount)}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                  STATUS_STYLES[order.status] ||
                                  "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(order.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <ShoppingBag size={26} />
                    </div>

                    <p className="mt-4 font-semibold text-gray-900">
                      No orders yet
                    </p>

                    <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                      Customer orders will appear here once they are placed.
                    </p>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-gray-900">Store Overview</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Key metrics across your store
                </p>

                <div className="mt-6 space-y-6">
                  {overview.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                            <Icon size={19} />
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              {item.title}
                            </p>

                            <p className="mt-0.5 text-xl font-bold text-gray-900">
                              {item.value}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={item.link}
                          className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-800"
                        >
                          View
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Common store management tasks
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link
                  to="/admin/products/add"
                  className="rounded-2xl border border-gray-200 p-5 transition hover:border-green-300 hover:shadow-md"
                >
                  <Plus className="text-green-700" size={24} />

                  <h3 className="mt-4 font-bold text-gray-900">Add Product</h3>

                  <p className="mt-1 text-sm text-gray-500">
                    List a new product in the catalog.
                  </p>
                </Link>

                <Link
                  to="/admin/categories/add"
                  className="rounded-2xl border border-gray-200 p-5 transition hover:border-green-300 hover:shadow-md"
                >
                  <Package className="text-green-700" size={24} />

                  <h3 className="mt-4 font-bold text-gray-900">
                    Add Category
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Organize products into categories.
                  </p>
                </Link>

                <Link
                  to="/admin/blog/create"
                  className="rounded-2xl border border-gray-200 p-5 transition hover:border-green-300 hover:shadow-md"
                >
                  <FileText className="text-green-700" size={24} />

                  <h3 className="mt-4 font-bold text-gray-900">
                    Create Article
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Publish content for the knowledge hub.
                  </p>
                </Link>

                <Link
                  to="/admin/website-content"
                  className="rounded-2xl border border-gray-200 p-5 transition hover:border-green-300 hover:shadow-md"
                >
                  <LayoutDashboard className="text-green-700" size={24} />

                  <h3 className="mt-4 font-bold text-gray-900">
                    Website Content
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage site-wide content and settings.
                  </p>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
