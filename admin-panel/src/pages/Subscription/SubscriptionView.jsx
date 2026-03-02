import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

const SubscriptionView = () => {
  const { subscriptionId } = useParams(); // Get subscriptionId from URL
  const navigate = useNavigate(); // Navigate function
  const { getDataByParams } = useApi(); // API hook

  const [subscriptionData, setSubscriptionData] = useState({
    title: "",
    price: "",
    type: 0,
    description: "",
  });

  const [loading, setLoading] = useState(!!subscriptionId);

  // Fetch Subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(
          ApiEndPoint.subscriptionDetail,
          subscriptionId
        );

        if (response?.success && response.data) {
          setSubscriptionData({
            title: response.data.title || "",
            price: response.data.price || "",
            type: response.data.type || 0,
            description: response.data.description || "",
          });
        } else {
          toast.error("Failed to fetch subscription data");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching subscription");
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) fetchSubscription();
  }, [subscriptionId]);

  // Format type
  const formatType = (type) => {
    switch (type) {
      case 0:
        return "Free";
      case 1:
        return "Monthly";
      case 2:
        return "Yearly";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/subscriptions")}
            className="bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl text-center font-semibold text-gray-800 flex-1">
            View Subscription
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading Subscription...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Title
              </label>
              <input
                type="text"
                value={subscriptionData.title}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                placeholder="No title available"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Price
              </label>
              <input
                type="text"
                value={subscriptionData.price}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                placeholder="No price available"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Type
              </label>
              <input
                type="text"
                value={formatType(subscriptionData.type)}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Description
              </label>
              <textarea
                value={subscriptionData.description}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                rows={4}
                placeholder="No description available"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionView;
