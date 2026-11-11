import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import useProducts from "../../../hooks/useProducts";
import { useCategoryContext } from "../../../context/CategoryContext";
import useWebsiteContent from "../../../hooks/useWebsiteContent";
import useReviews from "../../../hooks/useReviews";
import useAuth from "../../../hooks/useAuth";
import { useCart } from "../../../context/CartContext";
import { useFavorites } from "../../../context/FavoritesContext";
import { fashionImages } from "../../../data/fashionImages";
import { getFeaturedPosts } from "../../../services/blogService";
import { formatArticleDate } from "../../../utils/formatDate";
import CardStack from "../../../components/ui/CardStack";
import ScrollReveal from "../../../components/ui/ScrollReveal";

const fallbackSlides = [
  {
    eyebrow: "THE NEW SEASON EDIT",
    title: ["Find your", "everyday style."],
    description:
      "Thoughtful pieces, easy outfits and the little details that make getting dressed feel good.",
    image: fashionImages[0],
    buttonText: "Shop the collection",
    buttonLink: "/shop",
    secondaryButtonText: "Explore categories",
    secondaryButtonLink: "/categories",
  },
  {
    eyebrow: "A LITTLE MORE YOU",
    title: ["Wear what", "moves you."],
    description:
      "Discover fresh finds for workdays, weekends and every moment in between.",
    image: fashionImages[3],
    buttonText: "Discover new arrivals",
    buttonLink: "/shop",
    secondaryButtonText: "Our story",
    secondaryButtonLink: "/about",
  },
];

const formatPrice = (price) =>
  `₦${Number(price || 0).toLocaleString("en-NG")}`;

const heroItems = [
  { id: 1, title: "New Season Edit", description: "Thoughtful pieces for everyday style", imageSrc: fashionImages[0], href: "/shop" },
  { id: 2, title: "A Little More You", description: "Fresh finds for workdays and weekends", imageSrc: fashionImages[3], href: "/shop" },
  { id: 3, title: "Curated Looks", description: "Styles that move with you", imageSrc: fashionImages[1], href: "/categories" },
  { id: 4, title: "Timeless Pieces", description: "Quality that lasts beyond seasons", imageSrc: fashionImages[2], href: "/shop" },
  { id: 5, title: "Made to Measure", description: "Tailored to your perfect fit", imageSrc: fashionImages[4] || fashionImages[0], href: "/shop" },
];

function Home() {
  const navigate = useNavigate();
  const { products = [] } = useProducts();
  const { activeCategories = [] } = useCategoryContext();
  const { content: siteContent } = useWebsiteContent();
  const { getGeneralReviews } = useReviews();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [addedProductId, setAddedProductId] = useState(null);
  const [articles, setArticles] = useState(null);
  const [articlesError, setArticlesError] = useState("");

  const slides = useMemo(() => {
    const savedSlides = Array.isArray(siteContent?.hero?.slides)
      ? siteContent.hero.slides.filter((slide) => slide && typeof slide === "object")
      : [];
    const legacyHero = siteContent?.hero;

    if (savedSlides.length) {
      return savedSlides.slice(0, 2).map((slide, index) => {
        const fallback = fallbackSlides[index] || fallbackSlides[0];
        const title = Array.isArray(slide.title)
          ? slide.title
          : typeof slide.title === "string" && slide.title.trim()
            ? [slide.title]
            : fallback.title;

        return {
          ...fallback,
          ...slide,
          title,
          description:
            slide.subtitle || slide.description || fallback.description,
          image: slide.image || fallback.image,
          buttonText: fallback.buttonText,
          buttonLink: fallback.buttonLink,
          secondaryButtonText: fallback.secondaryButtonText,
          secondaryButtonLink: fallback.secondaryButtonLink,
        };
      });
    }

    if (legacyHero && (legacyHero.title || legacyHero.subtitle)) {
      return [
        {
          ...fallbackSlides[0],
          title: Array.isArray(legacyHero.title)
            ? legacyHero.title
            : [legacyHero.title || fallbackSlides[0].title[0]],
          description: legacyHero.subtitle || fallbackSlides[0].description,
          image: legacyHero.image || fallbackSlides[0].image,
        },
        fallbackSlides[1],
      ];
    }

    return fallbackSlides;
  }, [siteContent]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "Active").slice(0, 4),
    [products],
  );
  const railProducts = useMemo(
    () => products.filter((product) => product.status === "Active").slice(0, 8),
    [products],
  );

  const reviews = useMemo(
    () =>
      getGeneralReviews()
        .filter(
          (review) => review.type === "general" && review.status === "Approved",
        )
        .sort(
          (first, second) =>
            new Date(second.date || 0).getTime() -
            new Date(first.date || 0).getTime(),
        )
        .slice(0, 3),
    [getGeneralReviews],
  );

  useEffect(() => {
    let active = true;

    getFeaturedPosts()
      .then(({ data }) => {
        if (active) setArticles(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((error) => {
        if (!active) return;
        setArticlesError(error?.message || "Unable to load stories.");
        setArticles([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAddToCart = (product) => {
    if (product.sizes?.length || product.colors?.length || product.styles?.length) {
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product, 1);
    setAddedProductId(product.id);
    window.setTimeout(
      () => setAddedProductId((current) => (current === product.id ? null : current)),
      1400,
    );
  };

  return (
    <div className="bg-[#171614] text-stone-100">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16 lg:px-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Chyomee Stores</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Style that feels like you.</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-400">
            Discover curated pieces for workdays, weekends, and every moment in between.
          </p>
        </div>
        <CardStack items={heroItems} autoAdvance intervalMs={2500} pauseOnHover showDots cardWidth={420} cardHeight={280} />
      </section>

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Find your next favourite</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Shop by category</h2>
          </div>
          <Link to="/categories" className="hidden items-center gap-2 text-sm font-semibold transition hover:text-stone-500 sm:inline-flex">
            All categories <ArrowRight size={16} />
          </Link>
        </div>
        {activeCategories.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {activeCategories.slice(0, 6).map((category, index) => (
              <ScrollReveal
                as="div"
                key={category.id || category.slug || category.name}
                delay={index * 0.045}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group relative block aspect-[4/5] overflow-hidden bg-stone-100"
                >
                <img
                  src={fashionImages[index % fashionImages.length]}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fashionImages[index % fashionImages.length];
                  }}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="absolute inset-x-3 bottom-4 text-center text-sm font-semibold text-white sm:bottom-5 sm:text-base">
                  {category.name}
                </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <Link
            to="/categories"
            className="flex min-h-52 items-center justify-center bg-stone-100 px-6 text-center font-medium text-stone-600"
          >
            Explore all available categories
          </Link>
        )}
        <Link to="/categories" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold sm:hidden">
          Explore all categories <ArrowRight size={16} />
        </Link>
      </ScrollReveal>

      <ScrollReveal as="section" className="bg-[#f7f6f3]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Picked for you</p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">The latest edit</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold transition hover:text-stone-500">
              Shop everything <ArrowRight size={16} />
            </Link>
          </div>

          {activeProducts.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-4">
              {activeProducts.map((product, index) => (
                <ScrollReveal
                  as="article"
                  key={product.id}
                  delay={index * 0.06}
                  className="group min-w-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                    <Link to={`/product/${product.id}`} className="block h-full">
                      <img
                        src={product.image || fashionImages[0]}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fashionImages[0];
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product)}
                      aria-label={`${isFavorite(product.id) ? "Remove" : "Add"} ${product.name} ${isFavorite(product.id) ? "from" : "to"} favorites`}
                      aria-pressed={isFavorite(product.id)}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-sm transition hover:bg-white"
                    >
                      <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} className={isFavorite(product.id) ? "text-rose-600" : ""} />
                    </button>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">{product.category}</p>
                    <Link to={`/product/${product.id}`} className="mt-1 block">
                      <h3 className="truncate text-sm font-medium sm:text-base">{product.name}</h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-stone-300 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                        aria-label={
                          product.sizes?.length || product.colors?.length || product.styles?.length
                            ? `Choose options for ${product.name}`
                            : `Add ${product.name} to bag`
                        }
                        title={
                          addedProductId === product.id
                            ? "Added to bag"
                            : product.sizes?.length || product.colors?.length || product.styles?.length
                              ? "Choose options"
                              : "Add to bag"
                        }
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                    {addedProductId === product.id && (
                      <p role="status" className="mt-2 text-xs font-medium text-emerald-700">Added to your bag</p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="bg-white px-6 py-14 text-center text-sm text-stone-600">
              New pieces are on the way. Explore the shop to see what is available.
            </div>
          )}
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" className="mx-auto grid max-w-7xl items-center gap-9 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="relative aspect-[5/4] overflow-hidden bg-stone-100">
          <img
            src={fashionImages[1]}
            alt="A curated selection of fashion and accessories"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">A considered collection</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Good style should feel like you.</h2>
          <p className="mt-5 text-base leading-7 text-stone-600">
            Meet your new go-to pieces. Explore the collection, save the looks you love, and make every purchase with a simple, secure checkout.
          </p>
          <Link to="/shop" className="mt-8 inline-flex min-h-12 items-center gap-3 bg-stone-900 px-6 text-sm font-semibold text-white transition hover:bg-stone-700">
            Find your look <ArrowRight size={17} />
          </Link>
        </div>
      </ScrollReveal>

      {articles?.length > 0 && (
        <ScrollReveal as="section" id="learn-and-grow" className="bg-[#f7f6f3]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Ideas & inspiration</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">From the journal</h2>
              </div>
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold">
                Read the journal <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {articles.map((article, index) => (
                <ScrollReveal
                  as="div"
                  key={article.id || article.slug || index}
                  delay={index * 0.06}
                >
                  <Link
                    to={`/blog/${article.slug || article.id}`}
                    className="group block bg-white"
                  >
                    <div className="aspect-[3/2] overflow-hidden bg-stone-200">
                      <img
                        src={article.image || fashionImages[index % fashionImages.length]}
                        alt={article.title || "Journal story"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{article.category || "The journal"}</p>
                      <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug">{article.title}</h3>
                      <p className="mt-3 text-xs text-stone-500">{formatArticleDate(article.date)}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
      {articlesError && (
        <p role="status" className="mx-auto max-w-7xl px-5 py-3 text-sm text-stone-500 sm:px-8 lg:px-10">{articlesError}</p>
      )}

      <ScrollReveal as="section" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Kind words</p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Our customers say it best</h2>
          </div>
          <div className="flex gap-4">
            {isAuthenticated && <Link to="/write-review" className="text-sm font-semibold underline underline-offset-4">Write a review</Link>}
            <Link to="/reviews" className="text-sm font-semibold underline underline-offset-4">All reviews</Link>
          </div>
        </div>
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review, index) => (
            <ScrollReveal as="figure" key={review.id || index} delay={index * 0.06} className="border border-stone-200 p-6">
                <div className="flex gap-1 text-amber-500" aria-label={`${review.rating || 5} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, star) => <Star key={star} size={14} fill={star < Number(review.rating || 5) ? "currentColor" : "none"} />)}
                </div>
                <blockquote className="mt-4 text-sm leading-6 text-stone-700">“{review.review || review.comment}”</blockquote>
                <figcaption className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{review.customer || "chyomee customer"}</figcaption>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-stone-300 px-6 py-10 text-sm text-stone-600">
            Be the first to share your experience. <Link to="/reviews" className="font-semibold underline underline-offset-4">Learn more</Link>
          </div>
        )}
      </ScrollReveal>

      <ScrollReveal as="section" className="bg-stone-900 px-5 py-14 text-center text-white sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Your next favourite is waiting</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">A little inspiration goes a long way.</h2>
        <Link to="/shop" className="mt-7 inline-flex min-h-12 items-center gap-2 bg-white px-6 text-sm font-semibold text-stone-900 transition hover:bg-stone-200">
          Shop chyomee <ArrowRight size={17} />
        </Link>
      </ScrollReveal>
    </div>
  );
}

export default Home;
