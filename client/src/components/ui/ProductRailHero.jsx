import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { fashionImages } from "../../data/fashionImages";

const cardHeights = ["h-[19rem]", "h-[22rem]", "h-[20rem]", "h-[23rem]"];

function ProductRailHero({
  products,
  eyebrow,
  title,
  description,
  buttonText,
  buttonLink,
  secondaryButtonText,
  secondaryButtonLink,
}) {
  const reduceMotion = useReducedMotion();
  const railRef = useRef(null);
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const pieces = useMemo(() => {
    if (products.length) {
      return products.map((product, index) => ({
        ...product,
        image:
          (Array.isArray(product.images) && product.images[0]) ||
          product.image ||
          fashionImages[index % fashionImages.length],
        link: product.id || product._id ? `/product/${product.id || product._id}` : "/shop",
      }));
    }

    return fashionImages.map((image, index) => ({
      id: `fashion-edit-${index}`,
      name: [
        "The everyday edit",
        "Weekend layers",
        "Modern essentials",
        "Made to move",
        "The finishing touch",
        "A little something new",
      ][index],
      category: "The style edit",
      image,
      link: "/shop",
    }));
  }, [products]);

  const updateScrollControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollBackward(rail.scrollLeft > 2);
    setCanScrollForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    updateScrollControls();
    rail.addEventListener("scroll", updateScrollControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(rail);
    return () => {
      rail.removeEventListener("scroll", updateScrollControls);
      resizeObserver.disconnect();
    };
  }, [pieces.length, updateScrollControls]);

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector("[data-rail-card]");
    const cardWidth = firstCard?.getBoundingClientRect().width || 200;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const nextPosition = Math.max(
      0,
      Math.min(maxScroll, rail.scrollLeft + direction * (cardWidth + 12)),
    );
    rail.scrollLeft = nextPosition;
    updateScrollControls();
  };

  const titleLines = Array.isArray(title) ? title : [title];

  return (
    <section className="relative overflow-hidden bg-[#171614] text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgba(196,163,111,0.12),transparent_52%)]" />
      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:min-h-[680px] lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 lg:px-10">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-600 sm:text-sm">
            {eyebrow || "chyomee · the new season"}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
            {titleLines.map((line, index) => (
              <span className="block" key={`${line}-${index}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={buttonLink || "/shop"}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-stone-900 px-6 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <ShoppingBag size={17} />
              {buttonText || "Shop the collection"}
            </Link>
            <Link
              to={secondaryButtonLink || "/categories"}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-stone-400 px-5 text-sm font-semibold text-stone-800 transition hover:border-stone-900 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              {secondaryButtonText || "Explore categories"}
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Easy shopping <span className="mx-2 text-stone-300">/</span>
            Secure checkout <span className="mx-2 text-stone-300">/</span>
            Made for your everyday
          </p>
        </div>

        <div className="relative min-w-0 pb-4 pt-12 sm:pt-14">
          <div
            aria-hidden="true"
            className="absolute left-3 right-3 top-8 h-px bg-stone-500/80 sm:left-5 sm:right-5 sm:top-10"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-1 sm:px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-300 sm:text-xs">
              A few of our favourites
            </p>
            {pieces.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRail(-1)}
                  disabled={!canScrollBackward}
                  aria-label="Show previous favourites"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-stone-100 transition hover:border-[#c4a36f] hover:bg-[#c4a36f] hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/20 disabled:hover:bg-white/10 disabled:hover:text-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a36f]"
                >
                  <ArrowLeft size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(1)}
                  disabled={!canScrollForward}
                  aria-label="Show more favourites"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-stone-100 transition hover:border-[#c4a36f] hover:bg-[#c4a36f] hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/20 disabled:hover:bg-white/10 disabled:hover:text-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a36f]"
                >
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <div
            ref={railRef}
            role="region"
            aria-label="Favourite products carousel"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollRail(-1);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollRail(1);
              }
            }}
            className="flex snap-none items-end justify-start gap-2 overflow-x-auto overscroll-x-contain px-1 pb-3 pt-1 scrollbar-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4a36f] sm:gap-3"
          >
            {pieces.map((piece, index) => (
              <motion.div
                key={piece.id || piece._id || piece.name}
                data-rail-card
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.55,
                  delay: reduceMotion ? 0 : index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={reduceMotion ? undefined : { y: -7 }}
                className={`relative w-[55%] min-w-[8.25rem] max-w-[18rem] shrink-0 sm:w-[48%] ${cardHeights[index % cardHeights.length]}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-[-1.95rem] z-10 h-8 w-9 -translate-x-1/2"
                >
                  <svg viewBox="0 0 40 34" className="h-full w-full" fill="none">
                    <path
                      d="M20 5c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.1-.5 2.2-1.3 2.9L20 13 3 22.2c-1.5.8-.9 3.1.8 3.1h32.4c1.7 0 2.3-2.3.8-3.1L20 13"
                      stroke="#70695e"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Link
                  to={piece.link}
                  aria-label={`View ${piece.name}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-t-[5rem] border border-white/15 bg-white/10 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.34)] transition duration-300 hover:shadow-[0_22px_48px_rgba(0,0,0,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-300 sm:p-3"
                >
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-t-[4.5rem] bg-[#302c27]">
                    <img
                      src={piece.image}
                      alt={piece.name}
                      loading={index > 1 ? "lazy" : "eager"}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
                    <span className="absolute bottom-3 left-3 rounded-full border border-white/45 bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-700 backdrop-blur-sm">
                      {piece.category || "New season"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-3 text-stone-100">
                    <span className="line-clamp-1 text-xs font-semibold text-stone-100 sm:text-sm">
                      {piece.name}
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#c4a36f]"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductRailHero;
