import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getPublicReviews } from "../services/reviewService";

export const initialReviews = [];

const normalizeReview = (review, fallbackId = Date.now()) => {
  if (!review || typeof review !== "object") return null;

  const safeType = review.type === "product" ? "product" : "general";
  const safeStatus = ["Approved", "Rejected", "Pending"].includes(review.status)
    ? review.status
    : "Pending";

  const safeComment = review.review || review.comment || "";
  const safeEmail = review.email || "";
  const safeProductName =
    review.productName ||
    review.product ||
    (safeType === "product" ? "Product Review" : "General Experience");
  const safeProduct =
    safeType === "product" ? safeProductName : "General Experience";

  const rawProductId =
    review.productId ??
    review.product_id ??
    (safeType === "product" && typeof review.product === "string"
      ? review.product
      : null);

  const safeLocation =
    typeof review.location === "string" ? review.location.trim() : "";

  return {
    id: review.id || `review-${fallbackId}`,
    type: safeType,
    customer: review.customer || review.name || "Anonymous",
    location: safeLocation,
    email: safeEmail,
    product: safeProduct,
    productName: safeProductName,
    rating: Math.min(5, Math.max(1, Number(review.rating || 5))),
    review: safeComment,
    comment: safeComment,
    date:
      review.date ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    status: safeStatus,
    productId: safeType === "product" ? String(rawProductId ?? "") : null,
  };
};

export const ReviewContext = createContext(null);

let reviewRequest = null;
let reviewsLoaded = false;

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return undefined;
    hasFetchedRef.current = true;

    let active = true;

    const loadReviews = async () => {
      if (reviewsLoaded && reviewRequest === null) {
        return;
      }

      if (reviewRequest) {
        setLoading(true);
        try {
          const response = await reviewRequest;
          if (!active) return;
          const next = Array.isArray(response?.data)
            ? response.data
                .filter((review) => review?.status === "Approved")
                .map((review) => normalizeReview(review))
                .filter(Boolean)
            : [];
          setReviews(next);
          setError("");
        } catch (requestError) {
          if (!active) return;
          setReviews([]);
          setError(requestError?.message || "Failed to load reviews.");
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      setLoading(true);
      reviewRequest = getPublicReviews()
        .then(({ data }) => {
          const next = Array.isArray(data)
            ? data
                .filter((review) => review?.status === "Approved")
                .map((review) => normalizeReview(review))
                .filter(Boolean)
            : [];
          if (active) {
            setReviews(next);
            setError("");
          }
          reviewsLoaded = true;
          return { data: next };
        })
        .catch((requestError) => {
          if (active) {
            setReviews([]);
            setError(requestError?.message || "Failed to load reviews.");
          }
          reviewsLoaded = true;
          return { data: [] };
        })
        .finally(() => {
          reviewRequest = null;
          if (active) setLoading(false);
        });
    };

    void loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const updateReview = (id, changes) => {
    setReviews((current) =>
      current.map((review) =>
        String(review.id) === String(id)
          ? normalizeReview({ ...review, ...changes }, String(id))
          : review,
      ),
    );
  };

  const addReview = (review) => {
    const nextReview = normalizeReview(
      {
        ...review,
        id:
          review.id ||
          `review-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        type: review.type === "product" ? "product" : "general",
        status: review.status || "Pending",
      },
      Date.now(),
    );

    setReviews((current) => {
      const existing = current.filter(
        (item) => String(item.id) !== String(nextReview.id),
      );
      return [nextReview, ...existing];
    });
    return nextReview;
  };

  const deleteReview = (id) => {
    setReviews((current) =>
      current.filter((review) => String(review.id) !== String(id)),
    );
  };

  const approveReview = (id) => updateReview(id, { status: "Approved" });
  const rejectReview = (id) => updateReview(id, { status: "Rejected" });

  const getReviewsState = async () => reviews;
  const getGeneralReviews = () =>
    reviews.filter(
      (review) => review.type === "general" && review.status === "Approved",
    );
  const getProductReviews = (productId) =>
    reviews.filter(
      (review) =>
        review.type === "product" &&
        String(review.productId) === String(productId) &&
        review.status === "Approved",
    );

  const value = useMemo(
    () => ({
      reviews,
      setReviews,
      loading,
      error,
      addReview,
      updateReview,
      deleteReview,
      approveReview,
      rejectReview,
      getReviews: getReviewsState,
      getGeneralReviews,
      getProductReviews,
    }),
    [reviews, loading, error],
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

export function useReviewContext() {
  const context = useContext(ReviewContext);

  if (!context) {
    throw new Error("useReviewContext must be used within a ReviewProvider");
  }

  return context;
}
