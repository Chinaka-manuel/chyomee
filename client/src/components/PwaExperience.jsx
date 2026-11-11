import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Cookie, RefreshCw } from "lucide-react";

const CONSENT_STORAGE_KEY = "niceman-cookie-consent";

const readCookieConsent = () => {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to read cookie consent preference:", error);
    return null;
  }
};

function PwaExperience() {
  const [cookieConsent, setCookieConsent] = useState(readCookieConsent);
  const [updateAvailable] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const updateApp = useRef(null);

  useEffect(() => {
    // PWA is intentionally disabled for local development.
    // The previous registerSW implementation remains here for future restoration.
    return () => {};
  }, []);

  useEffect(() => {
    if (!updateAvailable || showUpdatePrompt || updating) return undefined;
    const timer = window.setTimeout(() => setShowUpdatePrompt(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [updateAvailable, showUpdatePrompt, updating]);

  const saveCookieConsent = (choice) => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch (error) {
      console.warn("Unable to save cookie consent preference:", error);
    }
    setCookieConsent(choice);
  };

  const applyUpdate = async () => {
    if (!updateApp.current) return;
    setUpdating(true);
    setUpdateError("");
    try {
      await updateApp.current(true);
    } catch (error) {
      console.error("Unable to apply app update:", error);
      setUpdateError("The update could not be installed. Please try again.");
      setUpdating(false);
    }
  };

  return (
    <>
      {cookieConsent === null && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="rounded-xl bg-green-50 p-3 text-green-800">
                <Cookie size={23} />
              </span>
              <div>
                <h2
                  id="cookie-consent-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Cookies & privacy
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We use essential browser storage and cookies to keep your
                  account secure and remember your cart and preferences. You can
                  read how we handle personal information in our{" "}
                  <Link
                    to="/privacy"
                    onClick={() => saveCookieConsent("essential")}
                    className="font-semibold text-green-800 underline"
                  >
                    Privacy Policy
                  </Link>
                  . No advertising cookies are used by this app.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => saveCookieConsent("essential")}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => saveCookieConsent("accepted")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900"
              >
                <Check size={16} />
                Accept & continue
              </button>
            </div>
          </section>
        </div>
      )}

      {showUpdatePrompt && updateAvailable && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-update-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-800">
              <RefreshCw size={25} />
            </span>
            <h2
              id="app-update-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              An app update is available
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Update now to get the latest version of chyomee.
            </p>
            {updateError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {updateError}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                disabled={updating}
                onClick={() => setShowUpdatePrompt(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Not now
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={applyUpdate}
                className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {updating && <RefreshCw size={15} className="animate-spin" />}
                {updating ? "Updating…" : "Update app"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default PwaExperience;
