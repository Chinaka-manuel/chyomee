import { useEffect, useState } from "react";
import {
  deleteReview as removeReview,
  getReviews,
  updateReviewStatus,
} from "../../../services/adminService";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    getReviews()
      .then(({ data }) => setReviews(data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const setReviewStatus = async (id, status) => {
    try {
      const { data } = await updateReviewStatus(id, status);
      setReviews((current) =>
        current.map((review) => (review.id === id ? data : review)),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteReview = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      await removeReview(id);
      setReviews((current) => current.filter((review) => review.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(review.customer || "")
        .toLowerCase()
        .includes(q) ||
      String(review.email || "")
        .toLowerCase()
        .includes(q) ||
      String(review.location || "")
        .toLowerCase()
        .includes(q) ||
      String(review.product || "")
        .toLowerCase()
        .includes(q) ||
      String(review.comment || "")
        .toLowerCase()
        .includes(q);

    const matchesRating =
      ratingFilter === "All" || review.rating === Number(ratingFilter);

    const matchesStatus =
      statusFilter === "All" || review.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved",
  ).length;
  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending",
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage customer feedback about your products.
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalReviews}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Average Rating</p>
          <div className="mt-2 flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {averageRating}
            </h2>
            <span className="text-xl text-yellow-400">★</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {approvedReviews}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Review</p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-600">
            {pendingReviews}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search customer, product or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          />

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Review Content */}
              <div className="flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.customer}
                    </h3>
                    {review.location && (
                      <p className="text-xs text-gray-500">{review.location}</p>
                    )}
                    <p className="text-xs text-gray-500">{review.email}</p>
                  </div>

                  <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {review.product}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {renderStars(review.rating)}

                  <span className="text-sm font-medium text-gray-700">
                    {review.rating}/5
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  "{review.comment}"
                </p>

                <p className="mt-3 text-xs text-gray-400">
                  Submitted {review.date}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 lg:w-52 lg:justify-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    review.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : review.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {review.status}
                </span>

                {review.status === "Pending" && (
                  <>
                    <button
                      onClick={() => setReviewStatus(review.id, "Approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => setReviewStatus(review.id, "Rejected")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => deleteReview(review.id)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="rounded-xl bg-white py-12 text-center text-sm text-gray-500 shadow-sm">
            No reviews found.
          </div>
        )}
      </div>

      {/* Backend Note */}
      {/* Reviews are loaded from the backend Admin API; moderation actions persist to MongoDB. */}
    </div>
  );
}
