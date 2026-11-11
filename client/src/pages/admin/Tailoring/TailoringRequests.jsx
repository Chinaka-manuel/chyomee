import { useEffect, useState } from "react";
import { getTailoringRequests, updateTailoringRequest } from "../../../services/adminService";

const labelFor = (value) =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());

export default function TailoringRequests() {
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setError("");
    try {
      const { data } = await getTailoringRequests();
      const rows = Array.isArray(data) ? data : [];
      setRequests(rows);
      setQuotes(Object.fromEntries(rows.map((request) => [request.id, request.quote ?? ""])));
      setNotes(Object.fromEntries(rows.map((request) => [request.id, request.tailorNotes ?? ""])));
    } catch (requestError) {
      setError(requestError.message || "Unable to load custom tailoring requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const saveQuote = async (request, status = "Quoted") => {
    if (status === "Quoted" && (!Number.isFinite(Number(quotes[request.id])) || Number(quotes[request.id]) <= 0)) {
      setError("Enter a quote greater than zero before sending it.");
      return;
    }
    setSavingId(request.id);
    setError("");
    setMessage("");
    try {
      const payload = {
        status,
        ...(status === "Quoted" ? { quote: Number(quotes[request.id]) } : {}),
        tailorNotes: notes[request.id] || "",
      };
      const { data } = await updateTailoringRequest(request.id, payload);
      setRequests((current) => current.map((item) => item.id === request.id ? data : item));
      setMessage(status === "Quoted" ? `Quote sent to ${request.customer?.email || "the customer"}.` : "Request declined.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update this tailoring request.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Made-to-measure requests</h1>
        <p className="mt-1 text-sm text-gray-600">Review fabric choices and complete measurement sets, then send a quote for customer approval.</p>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {loading ? (
        <p role="status" className="rounded-xl bg-white p-8 text-gray-600">Loading requests…</p>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">No made-to-measure requests have been submitted.</div>
      ) : requests.map((request) => (
        <article key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{request.garmentName} <span className="font-normal text-gray-500">· {request.customer?.name || request.customer?.email}</span></h2>
              <p className="mt-1 text-sm text-gray-600">{request.customer?.email}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">{request.status}</span>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="font-semibold text-gray-800">Design & fabric</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{request.style}</p>
              <p className="mt-2 text-sm text-gray-600">
                {request.fabric?.source === "catalog" ? `Catalog fabric: ${request.fabric.name}` : `Customer-provided fabric: ${request.fabric?.description}`}
              </p>
              {request.productStyle && <p className="mt-1 text-sm text-gray-600">Selected garment style: {request.productStyle}</p>}
              {request.color && <p className="mt-1 text-sm text-gray-600">Color: {request.color}</p>}
            </section>
            <section>
              <h3 className="font-semibold text-gray-800">Measurements ({request.measurementUnit})</h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {Object.entries(request.measurements || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2 border-b border-gray-100 py-1">
                    <dt className="text-gray-500">{labelFor(key)}</dt>
                    <dd className="font-medium text-gray-800">{value}{key !== "ageYears" ? ` ${request.measurementUnit}` : " yrs"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          {request.status !== "Order created" && request.status !== "Preparing order" && (
            <form className="mt-6 grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveQuote(request); }}>
              <div>
                <label htmlFor={`quote-${request.id}`} className="mb-1.5 block text-sm font-semibold text-gray-700">Quote (₦)</label>
                <input id={`quote-${request.id}`} type="number" min="1" step="1" required value={quotes[request.id] ?? ""} onChange={(event) => setQuotes((current) => ({ ...current, [request.id]: event.target.value }))} className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-base" />
              </div>
              <div>
                <label htmlFor={`notes-${request.id}`} className="mb-1.5 block text-sm font-semibold text-gray-700">Note for customer (optional)</label>
                <textarea id={`notes-${request.id}`} maxLength={3000} rows={2} value={notes[request.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
              </div>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" disabled={savingId === request.id} className="min-h-11 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                  {savingId === request.id ? "Sending…" : request.status === "Quoted" ? "Update quote" : "Send quote"}
                </button>
                {request.status === "Submitted" && (
                  <button type="button" disabled={savingId === request.id} onClick={() => void saveQuote(request, "Rejected")} className="min-h-11 rounded-lg border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                    Decline request
                  </button>
                )}
              </div>
            </form>
          )}
          {request.status === "Order created" && <p className="mt-5 border-t border-gray-200 pt-4 text-sm text-blue-800">Quote accepted. Order ID: {request.orderId || "pending"}</p>}
        </article>
      ))}
    </div>
  );
}
