import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";
const FaqView = () => {
  const { faqId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams } = useApi();

  const [faqData, setFaqData] = useState({
    question: "",
    answer: "",
  });

  const [loading, setLoading] = useState(!!faqId);

  // Fetch FAQ data
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
        console.error("Fetch error:", err);
        toast.error("Error fetching FAQ");
      } finally {
        setLoading(false);
      }
    };

    if (faqId) fetchFaq();
  }, [faqId]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/faq")}
            className="bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl text-center font-semibold text-gray-800 flex-1">
            View FAQ
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading FAQ...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Question
              </label>
              <input
                type="text"
                value={faqData.question}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                placeholder="No question available"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Answer
              </label>
              <textarea
                value={faqData.answer}
                disabled
                rows={6}
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                placeholder="No answer available"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqView;
