import { useContext } from "react";
import {
  WebsiteContentContext,
  initialWebsiteContent,
} from "../context/WebsiteContentContext";

export default function useWebsiteContent() {
  const ctx = useContext(WebsiteContentContext);

  const localValue = {
    content: initialWebsiteContent,
    setContent: () => {},
    updateSection: () => {},
    setSection: () => {},
  };

  return ctx || localValue;
}
