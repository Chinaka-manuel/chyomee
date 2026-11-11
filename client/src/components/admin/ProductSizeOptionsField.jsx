import { useState } from "react";
import { X } from "lucide-react";

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export default function ProductSizeOptionsField({ sizes, onChange }) {
  const [customSize, setCustomSize] = useState("");

  const addSize = (value) => {
    const nextSize = value.trim();
    if (!nextSize) return;
    if (sizes.some((size) => size.toLowerCase() === nextSize.toLowerCase())) {
      setCustomSize("");
      return;
    }
    if (sizes.length >= 20) return;
    onChange([...sizes, nextSize]);
    setCustomSize("");
  };

  const toggleCommonSize = (size) => {
    const existing = sizes.find(
      (currentSize) => currentSize.toLowerCase() === size.toLowerCase(),
    );
    if (existing) {
      onChange(sizes.filter((currentSize) => currentSize !== existing));
    } else {
      addSize(size);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Size options</h3>
        <p className="mt-1 text-xs text-slate-500">
          Optional. Add the sizes customers can choose for this product.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMON_SIZES.map((size) => {
          const selected = sizes.some(
            (currentSize) => currentSize.toLowerCase() === size.toLowerCase(),
          );
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleCommonSize(size)}
              aria-pressed={selected}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor="custom-product-size">
          Add a custom size
        </label>
        <input
          id="custom-product-size"
          value={customSize}
          maxLength={30}
          onChange={(event) => setCustomSize(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSize(customSize);
            }
          }}
          placeholder="Add a custom size (e.g. 38)"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="button"
          onClick={() => addSize(customSize)}
          disabled={!customSize.trim() || sizes.length >= 20}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add size
        </button>
      </div>

      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Selected sizes">
          {sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {size}
              <button
                type="button"
                onClick={() =>
                  onChange(sizes.filter((currentSize) => currentSize !== size))
                }
                aria-label={`Remove size ${size}`}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
