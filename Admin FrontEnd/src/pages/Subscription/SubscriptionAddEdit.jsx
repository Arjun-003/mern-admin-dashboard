import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

const SubscriptionAddEdit = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams, putData, postData } = useApi();

  const [subscriptionData, setSubscriptionData] = useState({
    title: "",
    price: "",
    type: 0, // 0: Free, 1: Monthly, 2: Yearly
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!!subscriptionId);

  // Fetch existing subscription data
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
        toast.error("Error fetching subscription");
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) fetchSubscription();
  }, [subscriptionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    let validationErrors = {};
    if (!subscriptionData.title.trim())
      validationErrors.title = "Title is required.";
    if (subscriptionData.price === "" || isNaN(subscriptionData.price))
      validationErrors.price = "Valid price is required.";

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", subscriptionData.title.trim());
    formData.append("price", subscriptionData.price);
    formData.append("type", subscriptionData.type);
    formData.append("description", subscriptionData.description);

    if (subscriptionId) formData.append("id", subscriptionId);

    try {
      const response = subscriptionId
        ? await putData(ApiEndPoint.editSubscription, formData, true)
        : await postData(ApiEndPoint.addSubscription, formData, true);

      if (response?.success) {
        toast.success(
          subscriptionId
            ? "Subscription updated successfully"
            : "Subscription added successfully"
        );
        setTimeout(() => navigate("/subscriptions"), 150);
      } else {
        toast.error(response?.message || "Failed to save subscription");
      }
    } catch (err) {
      toast.error("Error saving subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/subscriptions")}
            className="text-white p-2 rounded-md hover:opacity-90 transition bg-slate-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 flex-1 text-center">
            {subscriptionId ? "Edit Subscription" : "Add Subscription"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading Subscription...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subscriptionData.title}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    title: e.target.value,
                  })
                }
                placeholder="Enter title"
                className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#529fb7]"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Price<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={subscriptionData.price}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    price: e.target.value,
                  })
                }
                placeholder="Enter price"
                className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 ${
                  errors.price
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#529fb7]"
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Type
              </label>
              <select
                value={subscriptionData.type}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    type: parseInt(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#529fb7]"
              >
                <option value={0}>Free</option>
                <option value={1}>Monthly</option>
                <option value={2}>Yearly</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Description
              </label>
              <textarea
                value={subscriptionData.description}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#529fb7]"
                rows={4}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/subscriptions")}
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
                {loading
                  ? "Processing..."
                  : subscriptionId
                  ? "Update Subscription"
                  : "Add Subscription"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubscriptionAddEdit;
