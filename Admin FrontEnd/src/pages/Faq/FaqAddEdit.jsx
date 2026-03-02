import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

const FaqAddEdit = () => {
  const { faqId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams, putData, postData } = useApi();

  const [faqData, setFaqData] = useState({
    question: "",
    answer: "",
  });

  const [loading, setLoading] = useState(!!faqId);
  const [errors, setErrors] = useState({
    question: "",
    answer: "",
  });

  // Fetch existing FAQ data if editing
  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(ApiEndPoint.faqDetail, faqId);

        if (response?.success && response.data) {
          setFaqData({
            question: response.data.question || "",
            answer: response.data.answer || "",
          });
        } else {
          toast.error("Failed to fetch FAQ data");
        }
      } catch (err) {
        toast.error("Error fetching FAQ");
      } finally {
        setLoading(false);
      }
    };

    if (faqId) fetchFaq();
  }, [faqId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!faqData.question.trim()) {
      newErrors.question = "Question is required";
    }

    if (!faqData.answer.trim()) {
      newErrors.answer = "Answer is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const payload = {
      question: faqData.question.trim(),
      answer: faqData.answer.trim(),
      ...(faqId && { id: faqId }),
    };

    try {
      const response = faqId
        ? await putData(ApiEndPoint.editFaq, payload)
        : await postData(ApiEndPoint.addFaq, payload);

      if (response?.success) {
        toast.success(
          faqId ? "FAQ updated successfully" : "FAQ added successfully"
        );
        setTimeout(() => navigate("/faq"), 150);
      } else {
        toast.error(response?.message || "Failed to save FAQ");
      }
    } catch (err) {
      toast.error("Error saving FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/faq")}
            className="text-white p-2 rounded-md hover:opacity-90 transition bg-slate-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 flex-1 text-center">
            {faqId ? "Edit FAQ" : "Add FAQ"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading FAQ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Question<span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={faqData.question}
                onChange={(e) => {
                  setFaqData({ ...faqData, question: e.target.value });
                  setErrors({ ...errors, question: "" });
                }}
                placeholder="Enter question"
                className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2
      ${
        errors.question
          ? "border-red-500 focus:ring-red-400"
          : "border-gray-300 focus:ring-[#529fb7]"
      }`}
              />

              {errors.question && (
                <p className="text-red-500 text-sm mt-1">{errors.question}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Answer<span className="text-red-500">*</span>
              </label>

              <textarea
                value={faqData.answer}
                onChange={(e) => {
                  setFaqData({ ...faqData, answer: e.target.value });
                  setErrors({ ...errors, answer: "" });
                }}
                placeholder="Enter answer"
                rows={6}
                className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2
      ${
        errors.answer
          ? "border-red-500 focus:ring-red-400"
          : "border-gray-300 focus:ring-[#529fb7]"
      }`}
              />

              {errors.answer && (
                <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/faq")}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:opacity-90"
                }`}
              >
                {loading ? "Processing..." : faqId ? "Update FAQ" : "Add FAQ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FaqAddEdit;
