import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import useAuth from "../../../hooks/useAuth";
import { getProduct } from "../../../services/productService";
import {
  createReview,
  getProductReviews,
} from "../../../services/reviewService";
import { useFavorites } from "../../../context/FavoritesContext";
import MadeToMeasureRequest from "../../../components/commerce/MadeToMeasureRequest";

const emptyReview = {
  rating: 5,
  review: "",
  location: "",
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [sizeError, setSizeError] = useState("");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchProduct = async () => {
      setLoading(true);

      try {
        const { data } = await getProduct(id);
        if (!active) return;
        setProduct(data);
        const gallery = Array.isArray(data.images) ? data.images : [];
        setSelectedImage(gallery[0] || data.image || "");
        setSelectedSize("");
        setSelectedColor("");
        setSelectedStyle("");
        setDraftQuantity(1);
        setSizeError("");
        setError("");
      } catch {
        if (!active) return;
        setError("Failed to load product.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchReviews = async () => {
      setReviewsLoading(true);

      try {
        const { data } = await getProductReviews(id);
        if (!active) return;

        const approvedReviews = Array.isArray(data)
          ? data.filter((review) => review?.status === "Approved")
          : [];
        setProductReviews(approvedReviews);
      } catch {
        if (!active) return;
        setProductReviews([]);
      } finally {
        if (active) {
          setReviewsLoading(false);
        }
      }
    };

    void fetchReviews();

    return () => {
      active = false;
    };
  }, [id]);

  const isWishlisted = !!product && isFavorite(product.id);
  const [addFeedback, setAddFeedback] = useState("");

  const averageRating =
    productReviews.length > 0
      ? (
          productReviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0,
          ) / productReviews.length
        ).toFixed(1)
      : "5.0";

  const formatPrice = (price) => `₦${price.toLocaleString("en-NG")}`;

  const existingCartItem = product
    ? cartItems.find(
        (item) =>
          String(item.id) === String(product.id) &&
          (item.selectedSize || "") === selectedSize &&
          (item.selectedColor || "") === selectedColor &&
          (item.selectedStyle || "") === selectedStyle,
      )
    : null;
  const quantity = existingCartItem ? existingCartItem.quantity : draftQuantity;

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((current) => ({ ...current, [name]: value }));
    if (reviewError) setReviewError("");
    if (reviewSuccess) setReviewSuccess("");
  };

  const handleProductReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/account/login", {
        state: { from: `/products/${id}` },
      });
      return;
    }

    if (!product?.id) {
      setReviewError("Product information is unavailable to submit a review.");
      return;
    }

    const trimmedReview = reviewForm.review.trim();

    if (!trimmedReview) {
      setReviewError("Please write a short review before submitting.");
      return;
    }

    if (trimmedReview.length < 10) {
      setReviewError(
        "Please share a bit more detail so your review is helpful.",
      );
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const payload = {
        type: "product",
        product: String(product.id),
        customer: "",
        location: reviewForm.location.trim(),
        email: "",
        rating: Number(reviewForm.rating),
        review: trimmedReview,
        comment: trimmedReview,
        status: "Pending",
        date: new Date().toISOString(),
      };

      const { data } = await createReview(payload);
      setReviewSuccess("Thanks for your review");
      setReviewForm(emptyReview);
      setProductReviews((current) => {
        const next = current.filter((item) => item.id !== data?.id);
        return next;
      });
    } catch (requestError) {
      setReviewError(
        requestError?.message || "Unable to submit your review right now.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const increaseQuantity = () => {
    if (existingCartItem) {
      const next = existingCartItem.quantity + 1;
      updateQuantity(product.id, next, selectedSize, selectedColor, selectedStyle);
      return;
    }

    setDraftQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    if (existingCartItem) {
      if (existingCartItem.quantity > 1) {
        updateQuantity(
          product.id,
          existingCartItem.quantity - 1,
          selectedSize,
          selectedColor,
          selectedStyle,
        );
      }
      return;
    }

    setDraftQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = () => {
    if (
      (product.sizes?.length && !selectedSize) ||
      (product.colors?.length && !selectedColor) ||
      (product.styles?.length && !selectedStyle)
    ) {
      setSizeError("Choose all available options before adding this item to your bag.");
      return;
    }

    setSizeError("");
    const selectedVariants = [
      selectedSize && `Size: ${selectedSize}`,
      selectedColor && `Color: ${selectedColor}`,
      selectedStyle && `Style: ${selectedStyle}`,
    ]
      .filter(Boolean)
      .join(" · ");
    if (existingCartItem) {
      const nextQty = existingCartItem.quantity + 1;
      updateQuantity(product.id, nextQty, selectedSize, selectedColor, selectedStyle);
      setAddFeedback(
        `${product.name}${selectedVariants ? ` · ${selectedVariants}` : ""} quantity increased (${nextQty} in bag)`,
      );
    } else {
      addToCart(product, draftQuantity, {
        selectedSize,
        selectedColor,
        selectedStyle,
      });
      setAddFeedback(
        `${product.name}${selectedVariants ? ` · ${selectedVariants}` : ""} added to bag`,
      );
    }

    window.setTimeout(() => setAddFeedback(""), 1200);
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg text-gray-600">Loading product...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="min-h-[60vh] bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-4 text-gray-600">
            {error || "The product you are looking for could not be found."}
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-stone-700"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-stone-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/shop"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

          <p className="text-sm font-semibold uppercase tracking-wider text-white/65">
            {product.category}
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {product.name}
          </h1>
        </div>
      </section>

      {/* Product Details */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          {/* Product Image */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selectedImage || product.image}
                  src={selectedImage || product.image}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                  className="h-full w-full object-contain object-center"
                />
              </AnimatePresence>
            </div>
            {(product.images?.length > 1 || product.image) && (
              <div className="flex flex-wrap gap-2" aria-label="Product images">
                {(product.images?.length ? product.images : [product.image]).map(
                  (image, index) => (
                    <motion.button
                      key={image}
                      type="button"
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={selectedImage === image}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white p-1 transition sm:h-20 sm:w-20 ${
                        selectedImage === image
                          ? "border-stone-900"
                          : "border-transparent hover:border-stone-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </motion.button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              {product.category}
            </p>

            <h2 className="mt-3 font-serif text-3xl text-gray-900 sm:text-4xl">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>

              <span className="text-sm text-gray-500">
                {averageRating} ({productReviews.length} review
                {productReviews.length === 1 ? "" : "s"})
              </span>
            </div>

            {/* Price */}
            <p className="mt-6 text-3xl font-semibold text-stone-900">
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            {product.sizes?.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold text-gray-900">
                  Choose your size
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      type="button"
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError("");
                        setDraftQuantity(1);
                      }}
                      aria-pressed={selectedSize === size}
                      className={`min-w-12 rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 ${
                        selectedSize === size
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 bg-white text-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.colors?.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold text-gray-900">
                  Color{selectedColor ? ` · ${selectedColor}` : ""}
                </legend>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                      onClick={() => {
                        setSelectedColor(color);
                        setSizeError("");
                      }}
                      aria-label={`Choose ${color}`}
                      aria-pressed={selectedColor === color}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 ${
                        selectedColor === color
                          ? "border-stone-900 ring-2 ring-stone-300 ring-offset-2"
                          : "border-stone-200 hover:border-stone-500"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            color.toLowerCase() === "cream"
                              ? "#f5f0e6"
                              : color.toLowerCase() === "beige"
                                ? "#d8c3a5"
                                : color.toLowerCase() === "grey"
                                  ? "#9ca3af"
                                  : color,
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.styles?.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold text-gray-900">
                  Choose your style
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.styles.map((style) => (
                    <motion.button
                      key={style}
                      type="button"
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                      onClick={() => {
                        setSelectedStyle(style);
                        setSizeError("");
                      }}
                      aria-pressed={selectedStyle === style}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 ${
                        selectedStyle === style
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 bg-white text-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {style}
                    </motion.button>
                  ))}
                </div>
              </fieldset>
            )}

            {sizeError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {sizeError}
              </p>
            )}

            {/* Features */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900">
                Product Features
              </h3>

              <ul className="mt-4 space-y-3">
                {(
                  product.features || [
                    "Carefully selected for quality",
                    "See product details for specifications",
                    "Contact us if you need assistance",
                    "Follow the care or usage instructions provided",
                  ]
                ).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-800">
                      <Check size={13} />
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Quantity
              </p>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="flex h-11 w-11 items-center justify-center rounded-l-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
                >
                  <Minus size={17} />
                </button>

                <div className="flex h-11 w-14 items-center justify-center border-y border-gray-300 text-sm font-semibold text-gray-900">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="flex h-11 w-11 items-center justify-center rounded-r-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-2 bg-stone-900 px-6 py-3.5 font-semibold text-white transition hover:bg-stone-700"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!product) return;
                  toggleFavorite(product);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border px-5 py-3.5 font-semibold transition ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Heart
                  size={19}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                {isWishlisted ? "Saved" : "Wishlist"}
              </button>
            </div>

            <AnimatePresence>
            {addFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                className="mt-4 inline-flex items-center gap-2 border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-800"
                role="status"
              >
                <Check size={16} />
                {addFeedback}
              </motion.div>
            )}
            </AnimatePresence>

            {/* Delivery Info */}
            <div className="mt-8 border border-stone-200 bg-stone-50 p-5">
              <p className="font-semibold text-stone-900">
                Product details & customer care
              </p>

              {/* <p className="mt-1 text-sm leading-6 text-green-800">
                Product availability, delivery options, and other order details
                will be connected to the store system later.
              </p> */}
            </div>
            {product.madeToMeasure && (
              <MadeToMeasureRequest
                key={product.id}
                product={product}
                selectedColor={selectedColor}
                selectedStyle={selectedStyle}
              />
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                Product Reviews
              </p>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                Customer feedback
              </h3>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
              Loading reviews...
            </div>
          ) : productReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-600">
              No review available for this product yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {productReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.customer || "Anonymous"}
                      </h4>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    “{review.comment || review.review || "Great product."}”
                  </p>
                  {review.location && (
                    <p className="mt-3 text-xs font-medium text-gray-500">
                      {review.location}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Review Form */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="font-serif text-xl text-stone-900">
                Leave a review for this product
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {isAuthenticated
                  ? "Share your experience with this product."
                  : "Sign in to share your experience with this product."}
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  You need to be logged in to submit a review.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/account/login", {
                      state: { from: `/products/${id}` },
                    })
                  }
                  className="inline-flex items-center justify-center bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  Sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleProductReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm((current) => ({
                            ...current,
                            rating: star,
                          }))
                        }
                        className={`text-2xl ${
                          star <= reviewForm.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        aria-label={`Rate ${star} out of 5`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your review
                  </label>
                  <textarea
                    id="product-review"
                    name="review"
                    rows={5}
                    value={reviewForm.review}
                    onChange={handleReviewChange}
                    placeholder="Tell other customers about your experience with this product."
                    className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-stone-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    id="product-location"
                    name="location"
                    type="text"
                    value={reviewForm.location}
                    onChange={handleReviewChange}
                    placeholder="Lagos, Abuja, Ogun, Kaduna..."
                    className="mt-2 w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-stone-700"
                  />
                </div>

                {reviewError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div className="border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                    {reviewSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center justify-center bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
