import { useContext, useState, useMemo } from "react";
import { OrderContext, initialOrders } from "../context/OrderContext";

export default function useOrders() {
  const ctx = useContext(OrderContext);

  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);

  const getOrder = (id) =>
    orders.find((order) => String(order.id) === String(id));

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: order.id || `NA-${Date.now()}`,
      date:
        order.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    };

    setOrders((current) => [newOrder, ...current]);

    return newOrder;
  };

  const updateOrder = (id, updatedData) => {
    setOrders((current) =>
      current.map((order) =>
        String(order.id) === String(id) ? { ...order, ...updatedData } : order,
      ),
    );
  };

  const updateOrderStatus = (id, status) => updateOrder(id, { status });

  const updatePaymentStatus = (id, paymentStatus) =>
    updateOrder(id, { paymentStatus });

  const deleteOrder = (id) =>
    setOrders((current) =>
      current.filter((order) => String(order.id) !== String(id)),
    );

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "Pending"),
    [orders],
  );
  const processingOrders = useMemo(
    () => orders.filter((o) => o.status === "Processing"),
    [orders],
  );
  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === "Delivered"),
    [orders],
  );
  const cancelledOrders = useMemo(
    () => orders.filter((o) => o.status === "Cancelled"),
    [orders],
  );

  const totalSales = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "Paid")
        .reduce((s, o) => s + (o.total || 0), 0),
    [orders],
  );

  const localValue = {
    orders,
    setOrders,
    loading,
    setLoading,
    getOrder,
    addOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    totalSales,
  };

  return ctx || localValue;
}
