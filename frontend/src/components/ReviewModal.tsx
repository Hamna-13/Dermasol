import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  consultationId?: string | null;
};

const ReviewModal = ({ isOpen, onClose, consultationId }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [conditionAccurate, setConditionAccurate] = useState<string>("");
  const [productsRelevant, setProductsRelevant] = useState<string>("");
  const [satisfied, setSatisfied] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { getAccessToken } = useAuth();

  const resetForm = () => {
    setRating(0);
    setConditionAccurate("");
    setProductsRelevant("");
    setSatisfied("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isFormComplete =
    rating > 0 && conditionAccurate && productsRelevant && satisfied;

  const handleSubmit = async () => {
    if (!isFormComplete || submitting) return;

    try {
      setSubmitting(true);

      const token = await getAccessToken();

      if (!token) {
        alert("You must be logged in to submit a review.");
        return;
      }

      const reviewData = {
        rating,
        condition_identification: conditionAccurate === "yes",
        products_recommended: productsRelevant === "yes",
        experience: satisfied === "yes",
      };

      console.log("Submitting review:", reviewData);

      await apiFetch("/reviews/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (consultationId) {
        localStorage.setItem(`review_submitted_${consultationId}`, "true");
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error("Review submission failed:", error);
      alert("Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const YesNoQuestion = ({
    question,
    value,
    setValue,
  }: {
    question: string;
    value: string;
    setValue: (value: string) => void;
  }) => {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">{question}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setValue("yes")}
            disabled={submitting}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition ${
              value === "yes"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-teal-500"
            } ${submitting ? "cursor-not-allowed opacity-70" : ""}`}
          >
            Yes
          </button>

          <button
            type="button"
            onClick={() => setValue("no")}
            disabled={submitting}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition ${
              value === "no"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-teal-500"
            } ${submitting ? "cursor-not-allowed opacity-70" : ""}`}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Share Your Feedback
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Before you leave, please tell us how helpful your DermaSol analysis was.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Close review popup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-800">
            How would you rate your experience?
          </p>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                disabled={submitting}
                className="transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={30}
                  className={
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <YesNoQuestion
            question="Was DermaSol able to identify your condition accurately?"
            value={conditionAccurate}
            setValue={setConditionAccurate}
          />

          <YesNoQuestion
            question="Was DermaSol able to recommend products according to your intent?"
            value={productsRelevant}
            setValue={setProductsRelevant}
          />

          <YesNoQuestion
            question="Are you satisfied with your experience?"
            value={satisfied}
            setValue={setSatisfied}
          />
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Maybe Later
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormComplete || submitting}
            className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${
              isFormComplete && !submitting
                ? "bg-teal-600 hover:bg-teal-700"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
