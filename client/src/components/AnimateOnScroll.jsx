import { useEffect, useRef, useState } from "react";

// Reusable animate-on-scroll component.
// Usage: <AnimateOnScroll className="..." delay={100}><div>...</div></AnimateOnScroll>
export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  as: Component = "div",
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            // keep observed to allow re-trigger on leave/enter if desired
            // observer.unobserve(node);
          }
        });
      },
      { threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  const base =
    "opacity-0 translate-y-4 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out";
  const visibleCls = "opacity-100 translate-y-0";

  const style = visible
    ? { transitionDelay: `${delay}ms` }
    : { transitionDelay: 0 };

  return (
    <Component
      ref={ref}
      className={`${className} ${base} ${visible ? visibleCls : ""}`}
      style={style}
    >
      {children}
    </Component>
  );
}
