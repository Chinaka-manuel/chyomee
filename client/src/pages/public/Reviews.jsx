import { Link } from "react-router-dom";
import useReviews from "../../hooks/useReviews";
import useAuth from "../../hooks/useAuth";
import AnimateOnScroll from "../../components/AnimateOnScroll";

export default function Reviews() {
  const { getGeneralReviews } = useReviews();
  const { isAuthenticated } = useAuth();
  const reviews = getGeneralReviews().filter(
    (review) => review.status === "Approved",
  );

  return (
    <div className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
              Reviews
            </p>
            <h1 className="mt-2 text-3xl font-bold text-green-950 sm:text-4xl">
              Customer Feedback
            </h1>
          </div>

          {isAuthenticated && (
            <Link
              to="/write-review"
              className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Write a Review
            </Link>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No approved reviews yet
            </h2>
            <p className="mt-2 text-gray-600">
              Be the first to share your experience with us.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review, idx) => (
              <AnimateOnScroll
                as="article"
                key={review.id}
                delay={idx * 60}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                      {review.customer
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {review.customer}
                      </h2>
                      {review.location && (
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {review.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
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

                <p className="mt-5 text-sm leading-7 text-gray-700">
                  “{review.review}”
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
