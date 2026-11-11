import { upload } from "../services/api";

const extractUploadedUrl = (payload) => {
  const candidates = [
    payload?.file?.url,
    payload?.file?.secure_url,
    payload?.file?.secureUrl,
    payload?.data?.file?.url,
    payload?.data?.file?.secure_url,
    payload?.data?.file?.secureUrl,
    payload?.data?.url,
    payload?.data?.secure_url,
    payload?.data?.secureUrl,
    payload?.url,
    payload?.secure_url,
    payload?.secureUrl,
  ];

  return (
    candidates.find((candidate) => {
      if (typeof candidate !== "string" || !candidate.trim()) return false;
      return (
        /^https:\/\//i.test(candidate) ||
        /^https:\/\/res\.cloudinary\.com\//i.test(candidate)
      );
    }) || null
  );
};

export function readFileAsDataUrl(file) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please select a valid image file."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Failed to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export async function uploadLocalImage(file) {
  if (!file) return null;
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const payload = await upload("/files/upload", formData);
  const uploadedUrl = extractUploadedUrl(payload);
  if (!uploadedUrl) {
    throw new Error("Image upload did not return a valid URL.");
  }
  return uploadedUrl;
}

export async function handleLocalImageUpload(event, onImageReady) {
  const file = event?.target?.files?.[0];
  if (!file) return null;

  try {
    const uploadedUrl = await uploadLocalImage(file);
    if (typeof onImageReady === "function") onImageReady(uploadedUrl);
    return uploadedUrl;
  } finally {
    if (event?.target) event.target.value = "";
  }
}
