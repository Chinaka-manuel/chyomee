import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ruler, Scissors } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { getProducts } from "../../services/productService";
import { createTailoringRequest } from "../../services/customerService";
import { garmentProfiles, measurementUnits } from "../../data/tailoringMeasurements";

const initialMeasurements = {};

export default function MadeToMeasureRequest({ product, selectedColor, selectedStyle }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [garmentType, setGarmentType] = useState("dress");
  const [measurementUnit, setMeasurementUnit] = useState("cm");
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [style, setStyle] = useState("");
  const [fabricSource, setFabricSource] = useState("catalog");
  const [fabricProductId, setFabricProductId] = useState("");
  const [fabricDescription, setFabricDescription] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [fabricError, setFabricError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getProducts({ category: "Fabrics & Textiles" })
      .then(({ data }) => {
        if (active) setFabrics((Array.isArray(data) ? data : []).filter((item) => item.isFabric));
      })
      .catch(() => {
        if (active) {
          setFabrics([]);
          setFabricError("We couldn’t load catalog fabrics. Retry later or choose to provide your own fabric.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const profile = garmentProfiles[garmentType];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/account/login", { state: { from: `/product/${product.id}` } });
      return;
    }
    if (
      (product.colors?.length && !selectedColor) ||
      (product.styles?.length && !selectedStyle)
    ) {
      setError("Choose an available color and style for this custom garment before continuing.");
      return;
    }
    if (!style.trim()) {
      setError("Describe the cut, finish, and any design details you want.");
      return;
    }
    if (fabricSource === "catalog" && !fabricProductId) {
      setError("Choose a fabric from the catalog or select customer-provided fabric.");
      return;
    }
    if (fabricSource === "customer" && !fabricDescription.trim()) {
      setError("Describe the fabric you will provide.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createTailoringRequest({
        productId: product.id,
        garmentType,
        measurementUnit,
        measurements,
        style: style.trim(),
        productStyle: selectedStyle,
        color: selectedColor,
        fabricSource,
        fabricProductId: fabricSource === "catalog" ? fabricProductId : "",
        fabricDescription: fabricSource === "customer" ? fabricDescription.trim() : "",
      });
      setSuccess(true);
      setMeasurements({});
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your tailoring request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 border border-stone-200 bg-stone-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-stone-900 p-2 text-white" aria-hidden="true">
          <Scissors size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Make it yours</h3>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Request a made-to-measure version. Our tailor will review your measurements and send a quote before you pay.
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        <Ruler size={17} aria-hidden="true" />
        {open ? "Close measurements" : "Start a custom request"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="mt-6 border-t border-stone-200 pt-6"
          >
            {success ? (
              <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                Your request is with our tailoring team. You can follow its progress and accept the quote in{" "}
                <Link to="/account/tailoring" className="font-semibold underline">your account</Link>.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="garmentType" className="mb-1.5 block text-sm font-semibold text-stone-800">Garment type</label>
                    <select id="garmentType" value={garmentType} onChange={(event) => setGarmentType(event.target.value)} className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm">
                      {Object.entries(garmentProfiles).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="measurementUnit" className="mb-1.5 block text-sm font-semibold text-stone-800">Measurement unit</label>
                    <select id="measurementUnit" value={measurementUnit} onChange={(event) => setMeasurementUnit(event.target.value)} className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm">
                      {measurementUnits.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
                    </select>
                  </div>
                </div>
                <fieldset>
                  <legend className="text-sm font-semibold text-stone-800">Measurements <span className="font-normal text-stone-500">({measurementUnit}, all required)</span></legend>
                  <p className="mb-3 mt-1 text-xs leading-5 text-stone-600">Measure over the undergarments you plan to wear. Enter body measurements, not garment dimensions.</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.fields.map(([key, label]) => (
                      <div key={key}>
                        <label htmlFor={`measure-${key}`} className="mb-1 block text-sm text-stone-700">{label} ({key === "ageYears" ? "years" : measurementUnit})</label>
                        <input
                          id={`measure-${key}`}
                          name={key}
                          type="number"
                          inputMode="decimal"
                          min={key === "ageYears" ? 0 : 1}
                          max={key === "ageYears" ? 18 : 400}
                          step={key === "ageYears" ? 1 : 0.1}
                          required
                          value={measurements[key] ?? ""}
                          onChange={(event) => setMeasurements((current) => ({ ...current, [key]: event.target.value }))}
                          className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="tailoringStyle" className="mb-1.5 block text-sm font-semibold text-stone-800">Style and fit preferences</label>
                  <textarea id="tailoringStyle" required maxLength={500} rows={3} value={style} onChange={(event) => setStyle(event.target.value)} placeholder="Describe the silhouette, neckline, sleeve, length, fit, or finishing details." className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm" />
                </div>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-stone-800">Fabric</legend>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex items-center gap-2 text-sm text-stone-700">
                      <input type="radio" name="fabricSource" value="catalog" checked={fabricSource === "catalog"} onChange={() => setFabricSource("catalog")} />
                      Choose a fabric from our catalog
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-700">
                      <input type="radio" name="fabricSource" value="customer" checked={fabricSource === "customer"} onChange={() => setFabricSource("customer")} />
                      I will provide my own fabric
                    </label>
                  </div>
                  {fabricSource === "catalog" ? (
                    <div>
                      <label htmlFor="catalogFabric" className="mb-1.5 block text-sm text-stone-700">Available fabric</label>
                      <select id="catalogFabric" required value={fabricProductId} onChange={(event) => setFabricProductId(event.target.value)} className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm">
                        <option value="">Select a fabric</option>
                        {fabrics.map((fabric) => <option key={fabric.id} value={fabric.id}>{fabric.name} — {`₦${Number(fabric.price).toLocaleString("en-NG")}`}</option>)}
                      </select>
                      {fabricError && <p role="alert" className="mt-1 text-xs text-red-700">{fabricError}</p>}
                      {!fabrics.length && <p className="mt-1 text-xs text-stone-600">No catalog fabrics are currently available. You can choose to provide your own fabric.</p>}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="fabricDescription" className="mb-1.5 block text-sm text-stone-700">Fabric description</label>
                      <textarea id="fabricDescription" required maxLength={1000} rows={2} value={fabricDescription} onChange={(event) => setFabricDescription(event.target.value)} placeholder="Fabric type, color, pattern, and any details the tailor should know." className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm" />
                    </div>
                  )}
                </fieldset>
                <button type="submit" disabled={saving} className="min-h-11 w-full rounded-lg bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
                  {saving ? "Sending request…" : "Send measurements for a quote"}
                </button>
                {!isAuthenticated && <p className="text-xs text-stone-600">You’ll be asked to sign in before submitting your measurements.</p>}
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
