import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { acceptTailoringQuote, getMyOrder, getMyTailoringRequests } from "../../services/customerService";
import AccountNavigation from "./AccountNavigation";

const labelFor = (value) =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());

const statusClass = (status) => {
  if (status === "Quoted") return "bg-emerald-100 text-emerald-800";
  if (status === "Rejected") return "bg-red-100 text-red-800";
  if (status === "Order created") return "bg-blue-100 text-blue-800";
  return "bg-amber-100 text-amber-800";
};

export default function TailoringRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [address, setAddress] = useState({ address: "", city: "", state: "", country: "", phone: "" });

  useEffect(() => {
    let active = true;
    getMyTailoringRequests()
      .then(({ data }) => {
        if (active) setRequests(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load your tailoring requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const acceptQuote = async (request) => {
    setPendingId(request.id);
    setError("");
    try {
      const { data: order } = await acceptTailoringQuote(request.id, address);
      navigate("/checkout/payment", { state: { order } });
    } catch (requestError) {
      setError(requestError.message || "Unable to create your order. Please review the delivery details and try again.");
      setPendingId("");
    }
  };

  const continueOrder = async (request) => {
    setPendingId(request.id);
    setError("");
    try {
      const { data: order } = await getMyOrder(request.orderId);
      if (order.paymentStatus === "Paid") {
        navigate(`/account/orders/${encodeURIComponent(request.orderId)}`);
      } else {
        navigate("/checkout/payment", { state: { order } });
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to load the order for payment.");
    } finally {
      setPendingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My tailoring requests</h1>
          <p className="mt-2 text-sm text-slate-600">Track your custom garments, review the tailor’s quote, and continue securely to payment.</p>
        </div>
        <AccountNavigation />
        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {loading ? (
          <p role="status" className="rounded-xl bg-white p-8 text-slate-600">Loading your tailoring requests…</p>
        ) : requests.length === 0 ? (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No custom requests yet</h2>
            <p className="mt-2 text-sm text-slate-600">Choose a made-to-measure garment from the shop to get started.</p>
            <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700">Browse the collection</Link>
          </section>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{request.garmentName || labelFor(request.garmentType)}</h2>
                    <p className="mt-1 text-sm text-slate-600">{request.style}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(request.status)}`}>{request.status}</span>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <section>
                    <h3 className="font-semibold text-slate-800">Fabric & design</h3>
                    <p className="mt-2 text-sm text-slate-600">{request.fabric?.source === "catalog" ? `Catalog fabric: ${request.fabric.name}` : `Your fabric: ${request.fabric?.description}`}</p>
                    {request.productStyle && <p className="mt-1 text-sm text-slate-600">Selected product style: {request.productStyle}</p>}
                    {request.color && <p className="mt-1 text-sm text-slate-600">Color: {request.color}</p>}
                  </section>
                  <section>
                    <h3 className="font-semibold text-slate-800">Submitted measurements ({request.measurementUnit})</h3>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {Object.entries(request.measurements || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                          <dt className="text-slate-500">{labelFor(key)}</dt>
                          <dd className="font-medium text-slate-800">{value}{key !== "ageYears" ? ` ${request.measurementUnit}` : " yrs"}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                </div>
                {request.status === "Quoted" && (
                  <section className="mt-6 border-t border-slate-200 pt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">Tailor’s quote</h3>
                      <p className="text-2xl font-bold text-stone-900">₦{Number(request.quote).toLocaleString("en-NG")}</p>
                    </div>
                    {request.tailorNotes && <p className="mt-2 text-sm text-slate-600">{request.tailorNotes}</p>}
                    <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void acceptQuote(request); }}>
                      <div className="sm:col-span-2">
                        <label htmlFor={`address-${request.id}`} className="mb-1 block text-sm font-medium text-slate-700">Delivery address</label>
                        <input id={`address-${request.id}`} required maxLength={300} value={address.address} onChange={(event) => setAddress((current) => ({ ...current, address: event.target.value }))} autoComplete="street-address" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base" />
                      </div>
                      {[
                        ["city", "City", "address-level2"],
                        ["state", "State / region", "address-level1"],
                        ["country", "Country", "country-name"],
                        ["phone", "Phone (optional)", "tel"],
                      ].map(([key, label, autocomplete]) => (
                        <div key={key}>
                          <label htmlFor={`${key}-${request.id}`} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                          <input id={`${key}-${request.id}`} required={key !== "phone"} maxLength={key === "phone" ? 32 : 100} autoComplete={autocomplete} type={key === "phone" ? "tel" : "text"} value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base" />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <button type="submit" disabled={pendingId === request.id} className="min-h-11 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60">
                          {pendingId === request.id ? "Preparing secure payment…" : "Accept quote & continue to payment"}
                        </button>
                      </div>
                    </form>
                  </section>
                )}
                {request.status === "Order created" && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <p className="text-sm text-blue-800">Your quote has been accepted. Complete payment to begin tailoring.</p>
                    <button type="button" disabled={pendingId === request.id} onClick={() => void continueOrder(request)} className="min-h-11 rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60">
                      {pendingId === request.id ? "Loading order…" : "Continue to payment"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
