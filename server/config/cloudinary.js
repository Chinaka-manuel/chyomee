import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const config = {};

if (process.env.CLOUDINARY_CLOUD_NAME) {
  config.cloud_name = process.env.CLOUDINARY_CLOUD_NAME.trim();
}
if (process.env.CLOUDINARY_API_KEY) {
  config.api_key = process.env.CLOUDINARY_API_KEY.trim();
}
if (process.env.CLOUDINARY_API_SECRET) {
  config.api_secret = process.env.CLOUDINARY_API_SECRET.trim();
}

if (
  config.api_key &&
  config.api_secret &&
  config.api_secret === config.api_key
) {
  console.warn(
    "[Cloudinary] CLOUDINARY_API_SECRET matches CLOUDINARY_API_KEY. Update server/.env with the real Cloudinary API secret from the dashboard.",
  );
}

cloudinary.config(config);

export const missingCloudinaryConfiguration = () =>
  [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]?.trim());

export default cloudinary;
