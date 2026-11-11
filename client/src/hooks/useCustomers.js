import { useContext, useState, useMemo } from "react";
import { CustomerContext, initialCustomers } from "../context/CustomerContext";

export default function useCustomers() {
  const ctx = useContext(CustomerContext);

  const [customers, setCustomers] = useState(initialCustomers);

  const addCustomer = (c) => {
    const next = {
      id: c.id || Date.now(),
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      joined: c.joined || new Date().toLocaleDateString(),
      orders: c.orders || 0,
      totalSpent: c.totalSpent || 0,
      status: c.status || "Active",
    };
    setCustomers((cur) => [next, ...cur]);
    return next;
  };

  const updateCustomer = (id, changes) =>
    setCustomers((cur) =>
      cur.map((c) => (String(c.id) === String(id) ? { ...c, ...changes } : c)),
    );

  const deleteCustomer = (id) =>
    setCustomers((cur) => cur.filter((c) => String(c.id) !== String(id)));

  const getCustomer = (id) =>
    customers.find((c) => String(c.id) === String(id));

  const activeCustomers = useMemo(
    () => customers.filter((c) => c.status === "Active"),
    [customers],
  );
  const inactiveCustomers = useMemo(
    () => customers.filter((c) => c.status === "Inactive"),
    [customers],
  );

  const localValue = {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    activeCustomers,
    inactiveCustomers,
  };

  return ctx || localValue;
}
