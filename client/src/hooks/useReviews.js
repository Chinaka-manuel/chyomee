import { useContext } from "react";
import { ReviewContext, initialReviews } from "../context/ReviewContext";

export default function useReviews() {
  const ctx = useContext(ReviewContext);

  const localValue = {
    reviews: initialReviews,
    setReviews: () => {},
    addReview: () => null,
    updateReview: () => {},
    deleteReview: () => {},
    approveReview: () => {},
    rejectReview: () => {},
    getReviews: async () => initialReviews,
    getGeneralReviews: () =>
      initialReviews.filter((review) => review.type === "general"),
    getProductReviews: (productId) =>
      initialReviews.filter(
        (review) =>
          review.type === "product" &&
          String(review.productId) === String(productId),
      ),
  };

  return ctx || localValue;
}
