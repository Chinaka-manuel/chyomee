import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMyOrder } from "../../services/customerService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const emptyOrder = {
  id: "",
  date: "",
  status: "Pending",
  paymentStatus: "Pending",
  paymentMethod: "N/A",
  deliveryMethod: "Standard Delivery",
  customer: {
    name: "",
    email: "",
    phone: "",
  },
  deliveryAddress: {
    address: "",
    city: "",
    state: "",
    country: "",
  },
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
};

const normalizeOrder = (order = {}) => {
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const customer =
    order.customer && typeof order.customer === "object"
      ? order.customer
      : { name: "", email: "", phone: "" };
  const deliveryAddress =
    order.deliveryAddress && typeof order.deliveryAddress === "object"
      ? order.deliveryAddress
      : {};

  return {
    id: order.id || "",
    date: order.date || "",
    status: order.status || "Pending",
    paymentStatus: order.paymentStatus || "Pending",
    paymentMethod: order.paymentMethod || "N/A",
    deliveryMethod: order.deliveryMethod || "Standard Delivery",
    customer: {
      name: customer.name || "",
      email: customer.email || order.email || "",
      phone: customer.phone || "",
    },
    deliveryAddress: {
      address: deliveryAddress.address || "",
      city: deliveryAddress.city || "",
      state: deliveryAddress.state || "",
      country: deliveryAddress.country || "",
    },
    items: rawItems.map((item, index) => ({
      id: item.id || item._id || `${order.id || "order"}-${index}`,
      name: item.name || "Product",
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
      image: item.image || "",
      size: item.size || "",
      color: item.color || "",
      style: item.style || "",
      productStyle: item.productStyle || "",
      tailoringRequestId: item.tailoringRequestId || "",
      garmentType: item.garmentType || "",
      fabric: item.fabric || null,
      measurementUnit: item.measurementUnit || "",
      measurements:
        item.measurements && typeof item.measurements === "object"
          ? item.measurements
          : null,
    })),
    subtotal: Number(order.subtotal ?? 0),
    discount: Number(order.discount ?? 0),
    total:
      Number(order.total ?? 0) ||
      Number(order.subtotal ?? 0) - Number(order.discount ?? 0),
  };
};

const statusStyle = (status = "") => {
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

function OrderDetails() {
  const { orderId } = useParams();
  const hasMissingOrderId = !orderId;
  const [order, setOrder] = useState(emptyOrder);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasMissingOrderId) {
      return undefined;
    }

    let active = true;

    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await getMyOrder(orderId);
        if (active) {
          setOrder(normalizeOrder(data ?? {}));
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.message || "Unable to load this order right now.");
        setOrder(emptyOrder);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchOrder();

    return () => {
      active = false;
    };
  }, [hasMissingOrderId, orderId]);

  const total = Number(order.total || order.subtotal || 0);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="transition hover:text-green-700">
            Home
          </Link>

          <span>/</span>

          <Link
            to="/account/orders"
            className="transition hover:text-green-700"
          >
            My Orders
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-700">Order Details</span>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Order Details</h1>

            <p className="mt-2 text-sm text-slate-500">
              {loading || !order.id ? "Loading order..." : `Order #${order.id}`}
            </p>
          </div>

          <Link
            to="/account/orders"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Orders
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="h-80 animate-pulse rounded-xl bg-slate-200 lg:col-span-2" />
              <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-900">
              We couldn’t load this order
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Link
              to="/account/orders"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Back to orders
            </Link>
          </div>
        ) : !order.id || hasMissingOrderId ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">
              Order not found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {hasMissingOrderId
                ? "This order could not be loaded because the route is missing an order id."
                : "This order is missing or no longer available to your account."}
            </p>
            <Link
              to="/account/orders"
              className="mt-6 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              Back to orders
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Date
                  </p>
                  <p className="mt-2 font-semibold text-slate-800">
                    {formatDate(order.date) || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyle(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyle(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Method
                  </p>
                  <p className="mt-2 font-semibold text-slate-800">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="rounded-xl bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Ordered Items
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-6">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-green-50">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🛍️</span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Quantity: {item.quantity}
                            </p>
                            {(item.size || item.color || item.productStyle || item.style) && (
                              <p className="mt-1 text-sm text-slate-500">
                                {[
                                  item.size && `Size: ${item.size}`,
                                  item.color && `Color: ${item.color}`,
                                  item.productStyle && `Selected style: ${item.productStyle}`,
                                  item.style && `Style notes: ${item.style}`,
                                ].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            {item.measurements && (
                              <div className="mt-3 rounded-lg bg-stone-50 p-3">
                                <p className="font-semibold text-stone-800">Made-to-measure details</p>
                                {item.fabric && (
                                  <p className="mt-1 text-sm text-slate-600">
                                    Fabric: {item.fabric.source === "catalog" ? item.fabric.name : item.fabric.description}
                                  </p>
                                )}
                                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                                  {Object.entries(item.measurements).map(([key, value]) => (
                                    <div key={key} className="flex justify-between gap-2">
                                      <dt className="text-slate-500">{key.replace(/([A-Z])/g, " $1")}</dt>
                                      <dd className="font-medium text-slate-700">{value}{key !== "ageYears" ? ` ${item.measurementUnit}` : " yrs"}</dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-slate-800">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatCurrency(
                                Number(item.price) * Number(item.quantity),
                              )}{" "}
                              total
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-lg font-semibold text-slate-800">
                    Order Summary
                  </h2>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(order.subtotal)}
                      </span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Discount</span>
                        <span className="font-medium text-green-700">
                          -{formatCurrency(order.discount)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between gap-4">
                        <span className="font-semibold text-slate-800">
                          Total
                        </span>
                        <span className="text-xl font-bold text-green-700">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-slate-800">
                  Customer Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Name</p>
                    <p className="font-medium text-slate-700">
                      {order.customer.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="font-medium text-slate-700">
                      {order.customer.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Phone</p>
                    <p className="font-medium text-slate-700">
                      {order.customer.phone || "—"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-slate-800">
                  Delivery Information
                </h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-400">Delivery Method</p>
                    <p className="font-medium text-slate-700">
                      {order.deliveryMethod || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Address</p>
                    <p className="font-medium text-slate-700">
                      {order.deliveryAddress.address || "—"}
                    </p>
                    {(order.deliveryAddress.city ||
                      order.deliveryAddress.state) && (
                      <p className="font-medium text-slate-700">
                        {[
                          order.deliveryAddress.city,
                          order.deliveryAddress.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    {order.deliveryAddress.country && (
                      <p className="font-medium text-slate-700">
                        {order.deliveryAddress.country}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default OrderDetails;
