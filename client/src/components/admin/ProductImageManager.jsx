import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { uploadLocalImage } from "../../utils/localImageUpload";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProductImageManager({
  images,
  onChange,
  onUploadingChange,
}) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setError("");

    if (!files.length) return;
    const slots = MAX_IMAGES - images.length;
    if (files.length > slots) {
      setError(`You can add up to ${MAX_IMAGES} product images.`);
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE,
    );
    if (invalidFile) {
      setError("Choose image files under 5 MB each.");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const uploadedImages = [];
      const uploadErrors = [];
      for (const file of files) {
        try {
          uploadedImages.push(await uploadLocalImage(file));
        } catch (uploadError) {
          uploadErrors.push(uploadError.message);
        }
      }
      if (uploadedImages.length) onChange([...images, ...uploadedImages]);
      if (uploadErrors.length) {
        setError(
          uploadErrors.length === files.length
            ? uploadErrors[0] || "Unable to upload the selected images."
            : `${uploadedImages.length} image(s) uploaded. ${uploadErrors.length} could not be uploaded.`,
        );
      }
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const makePrimary = (index) => {
    if (index === 0) return;
    onChange([images[index], ...images.filter((_, itemIndex) => itemIndex !== index)]);
  };

  const removeImage = (index) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Product images</h3>
          <p className="mt-1 text-xs text-slate-500">
            Add up to 5 images. The first image is the storefront cover.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="sr-only"
        aria-label="Upload product images"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <AnimatePresence initial={false}>
          {images.map((image, index) => (
            <motion.div
              key={image}
              layout
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <img
                src={image}
                alt={`Product view ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {index === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-sm">
                  <Star size={12} fill="currentColor" />
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makePrimary(index)}
                  disabled={uploading}
                  className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Set image ${index + 1} as cover`}
                >
                  Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={uploading}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Remove product image ${index + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-600 transition hover:border-slate-500 hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            <ImagePlus size={22} />
            <span className="text-xs font-semibold">
              {uploading ? "Uploading…" : "Add images"}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
