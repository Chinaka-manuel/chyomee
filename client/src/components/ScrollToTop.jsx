import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "auto",
    });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={handleScrollToTop}
      className={[
        "fixed z-50 flex items-center justify-center rounded-full bg-stone-900 text-white shadow-lg shadow-stone-900/20 transition-all duration-200 ease-out",
        "border border-stone-900/10 hover:bg-stone-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-300/70 active:scale-95",
        "h-12 w-12 sm:h-12 sm:w-12",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      ].join(" ")}
      style={{
        right: "calc(20px + env(safe-area-inset-right))",
        bottom: "calc(20px + env(safe-area-inset-bottom))",
      }}
    >
      <ArrowUp className="h-5 w-5 sm:h-[1.2rem] sm:w-[1.2rem]" />
    </button>
  );
}

export default ScrollToTop;
