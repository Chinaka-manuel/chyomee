import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getMyOrders } from "../../services/customerService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import AccountNavigation from "./AccountNavigation";

const filters = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const normalizeOrder = (order = {}, index = 0) => {
  const rawItems = Array.isArray(order.items) ? order.items : [];

  return {
    id: order.id || order._id || `order-${index}`,
    date: order.date || order.createdAt || "",
    status: order.status || "Pending",
    total: Number(order.total ?? 0),
    items: rawItems.map((item, itemIndex) => ({
      id: item.id || item._id || `${order.id || index}-${itemIndex}`,
      name: item.name || "Product",
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
      image: item.image || "",
    })),
  };
};

const MyOrders = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await getMyOrders();
        const normalizedOrders = Array.isArray(data)
          ? data.map((order, index) => normalizeOrder(order, index))
          : [];

        if (active) {
          setOrders(normalizedOrders);
        }
      } catch (fetchError) {
        if (!active) return;
        setError(
          fetchError?.message || "Unable to load your orders right now.",
        );
        setOrders([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const counts = {
      total: orders.length,
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.status || "Pending";
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" || order.status === activeFilter;

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.id).toLowerCase().includes(search) ||
        order.items.some((item) => item.name.toLowerCase().includes(search));

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Processing":
        return "bg-yellow-100 text-yellow-700";

      case "Pending":
        return "bg-amber-100 text-amber-700";

      case "Shipped":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle2 size={15} />;

      case "Processing":
        return <Clock3 size={15} />;

      case "Pending":
        return <Package size={15} />;

      case "Shipped":
        return <Truck size={15} />;

      case "Cancelled":
        return <XCircle size={15} />;

      default:
        return <Package size={15} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-linear-to-r from-green-800 to-green-600">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 text-sm font-medium text-green-100">
            Customer Account
          </p>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 max-w-xl text-green-100">
            View, track, and manage your chyomee orders.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Account Navigation */}
        <AccountNavigation />

        {/* Order Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <ShoppingBag size={21} />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {stats.total}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Total Orders</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 size={21} />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {stats.Pending + stats.Processing}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Processing</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Truck size={21} />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {stats.Shipped}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Shipped</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <CheckCircle2 size={21} />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {stats.Delivered}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">Delivered</p>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden gap-2 overflow-x-auto md:flex">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Mobile Filter */}
            <div className="md:hidden">
              <div className="relative">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                >
                  {filters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Orders */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
              No orders match your current search.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                      <ShoppingBag size={20} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        #{order.id}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>

                    <span className="text-sm text-gray-500">
                      {formatDate(order.date)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.7fr]">
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              IMG
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Total
                    </p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                    >
                      Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MyOrders;
