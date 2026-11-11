import { createContext, useContext, useMemo, useState } from "react";

export const initialOrders = [];

export const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const updateOrder = (id, changes) => {
    setOrders((current) =>
      current.map((order) =>
        String(order.id) === String(id) ? { ...order, ...changes } : order,
      ),
    );
  };

  const getOrder = (id) => orders.find((o) => String(o.id) === String(id));

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      loading: false,
      updateOrder,
      getOrder,
    }),
    [orders],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx)
    throw new Error("useOrderContext must be used within an OrderProvider");
  return ctx;
}
