import { useState } from "react";
import { X } from "lucide-react";

const COLOR_CHOICES = [
  { name: "Black", swatch: "#171717" },
  { name: "White", swatch: "#ffffff" },
  { name: "Cream", swatch: "#f5f0e6" },
  { name: "Beige", swatch: "#d8c3a5" },
  { name: "Brown", swatch: "#795548" },
  { name: "Red", swatch: "#dc2626" },
  { name: "Pink", swatch: "#ec4899" },
  { name: "Blue", swatch: "#2563eb" },
  { name: "Green", swatch: "#16a34a" },
  { name: "Grey", swatch: "#9ca3af" },
];

const STYLE_CHOICES = [
  "Regular Fit",
  "Relaxed Fit",
  "Oversized",
  "Slim Fit",
  "Cropped",
  "Classic",
];

function OptionGroup({ label, options, onChange, suggestions, maxOptions }) {
  const [customOption, setCustomOption] = useState("");

  const addOption = (value) => {
    const option = value.trim();
    if (
      !option ||
      options.some((existing) => existing.toLowerCase() === option.toLowerCase()) ||
      options.length >= maxOptions
    ) {
      setCustomOption("");
      return;
    }
    onChange([...options, option]);
    setCustomOption("");
  };

  const toggleSuggestion = (value) => {
    const existing = options.find(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );
    if (existing) onChange(options.filter((option) => option !== existing));
    else addOption(value);
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
        <p className="mt-1 text-xs text-slate-500">
          Optional. Customers will choose one when buying.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const value = typeof suggestion === "string" ? suggestion : suggestion.name;
          const swatch = typeof suggestion === "string" ? null : suggestion.swatch;
          const selected = options.some(
            (option) => option.toLowerCase() === value.toLowerCase(),
          );
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleSuggestion(value)}
              aria-pressed={selected}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
              }`}
            >
              {swatch && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 rounded-full border border-black/15"
                  style={{ backgroundColor: swatch }}
                />
              )}
              {value}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`custom-${label.toLowerCase()}`}>
          Add custom {label.toLowerCase()}
        </label>
        <input
          id={`custom-${label.toLowerCase()}`}
          value={customOption}
          maxLength={30}
          onChange={(event) => setCustomOption(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOption(customOption);
            }
          }}
          placeholder={`Add a custom ${label.toLowerCase()}`}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="button"
          onClick={() => addOption(customOption)}
          disabled={!customOption.trim() || options.length >= maxOptions}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {options.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={`Selected ${label.toLowerCase()} options`}>
          {options.map((option) => (
            <span
              key={option}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {option}
              <button
                type="button"
                onClick={() => onChange(options.filter((value) => value !== option))}
                aria-label={`Remove ${label.toLowerCase()} ${option}`}
                className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductVariantOptionsField({
  colors,
  styles,
  onColorsChange,
  onStylesChange,
}) {
  return (
    <section className="space-y-6 rounded-xl border border-slate-200 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Color and style options</h3>
        <p className="mt-1 text-xs text-slate-500">
          Set the available variations for this product. Customers can combine
          these with its size options.
        </p>
      </div>
      <OptionGroup
        label="Colors"
        options={colors}
        onChange={onColorsChange}
        suggestions={COLOR_CHOICES}
        maxOptions={20}
      />
      <div className="border-t border-slate-100" />
      <OptionGroup
        label="Styles"
        options={styles}
        onChange={onStylesChange}
        suggestions={STYLE_CHOICES}
        maxOptions={20}
      />
    </section>
  );
}
