import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

const InterestsAddEdit = () => {
  const { interestId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams, putData, postData, getData } = useApi();

  const [interestData, setInterestData] = useState({
    title: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!interestId);
  const [errors, setErrors] = useState({
    title: "",
    categoryId: "",
  });

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getData(ApiEndPoint.categoryList);
        if (response?.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch existing Interest data
  useEffect(() => {
    const fetchInterest = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(
          ApiEndPoint.interestDetail,
          interestId,
        );
        if (response?.success && response.data) {
          setInterestData({
            title: response.data.title || "",
            categoryId: response.data.categoryId || "",
          });
        } else {
          toast.error("Failed to fetch interest data");
        }
      } catch (err) {
        toast.error("Error fetching interest");
      } finally {
        setLoading(false);
      }
    };

    if (interestId) fetchInterest();
  }, [interestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = { title: "", categoryId: "" };

    if (!interestData.title.trim()) newErrors.title = "Title is required";
    if (!interestData.categoryId) newErrors.categoryId = "Category is required";

    if (newErrors.title || newErrors.categoryId) {
      setErrors(newErrors);
      return;
    }

    setErrors({ title: "", categoryId: "" });
    setLoading(true);

    const formData = new FormData();
    formData.append("title", interestData.title.trim());
    formData.append("categoryId", interestData.categoryId);
    if (interestId) formData.append("id", interestId);

    try {
      const response = interestId
        ? await putData(ApiEndPoint.editInterest, formData, true)
        : await postData(ApiEndPoint.addInterest, formData, true);

      if (response?.success) {
        toast.success(
          interestId
            ? "Interest updated successfully"
            : "Interest added successfully",
        );
        setTimeout(() => navigate("/interests"), 150);
      } else {
        toast.error(response?.message || "Failed to save interest");
      }
    } catch {
      toast.error("Error saving interest");
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
            onClick={() => navigate("/interests")}
            className="text-white p-2 rounded-md hover:opacity-90 transition bg-slate-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 flex-1 text-center">
            {interestId ? "Edit Interest" : "Add Interest"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading Interest...</p>
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
                value={interestData.title}
                onChange={(e) => {
                  setInterestData({ ...interestData, title: e.target.value });
                  setErrors({ ...errors, title: "" });
                }}
                placeholder="Enter title"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#529fb7]"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                value={interestData.categoryId}
                onChange={(e) =>
                  setInterestData({
                    ...interestData,
                    categoryId: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#529fb7]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/interests")}
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
                  : interestId
                    ? "Update Interest"
                    : "Add Interest"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InterestsAddEdit;
