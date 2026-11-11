import { post } from "./api";

export const sendContactMessage = async (message) =>
  post("/contact", message);
