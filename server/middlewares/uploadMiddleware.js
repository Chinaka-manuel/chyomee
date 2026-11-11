import multer from "multer";
import cloudinary, {
  missingCloudinaryConfiguration,
} from "../config/cloudinary.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 10,
    fields: 20,
    parts: 30,
  },
  fileFilter(_req, file, callback) {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ]);
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Unsupported upload file type");
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

export const saveUpload = (req, res, next) => {
  if (!req.file) return next();

  const missingConfiguration = missingCloudinaryConfiguration();
  if (missingConfiguration.length) {
    const error = new Error(
      `Cloudinary upload is unavailable. Configure: ${missingConfiguration.join(", ")}.`,
    );
    error.statusCode = 503;
    error.expose = true;
    return next(error);
  }

  const allowedFormats = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "tiff",
    "tif",
    "avif",
    "ico",
    "mp4",
    "mov",
    "avi",
  ];

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "mern_uploads",
      resource_type: "auto",
      allowed_formats: allowedFormats.join(","),
    },
    (error, result) => {
      if (error) {
        const appError = new Error(
          (error.error && error.error.message) ||
            error.message ||
            "Cloudinary upload failed",
        );
        appError.statusCode =
          error.http_code >= 500 || !error.http_code ? 502 : error.http_code;
        appError.expose = true;
        return next(appError);
      }
      if (!result?.secure_url || !result.public_id) {
        const appError = new Error("Cloudinary did not return an image URL.");
        appError.statusCode = 502;
        appError.expose = true;
        return next(appError);
      }
      req.file.path = result.secure_url;
      req.file.secure_url = result.secure_url;
      req.file.filename = result.public_id;
      req.file.resource_type = result.resource_type;
      return next();
    },
  );
  uploadStream.end(req.file.buffer);
};

export default upload;
