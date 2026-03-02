import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

const CategoryAddEdit = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams, putData, postData } = useApi();

  const [categoryData, setCategoryData] = useState({
    title: "",
  });

  const [loading, setLoading] = useState(!!categoryId);
  const [error, setError] = useState("");


  // Fetch existing category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const response = await getDataByParams(
          ApiEndPoint.categoryDetail,
          categoryId
        );

        if (response?.success && response.data) {
          setCategoryData({
            title: response.data.title || "",
          });
        } else {
          toast.error("Failed to fetch category data");
        }
      } catch (err) {
        toast.error("Error fetching category");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchCategory();
  }, [categoryId]);

  const removeImage = () => {
    setCategoryData({ ...categoryData, image: null });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryData.title.trim()) {
      setError("Title is required.");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", categoryData.title.trim());

    if (categoryId) {
      formData.append("id", categoryId);
    }

    try {
      const response = categoryId
        ? await putData(ApiEndPoint.editCategory, formData, true)
        : await postData(ApiEndPoint.addCategory, formData, true);

      if (response?.success) {
        toast.success(
          categoryId
            ? "Category updated successfully"
            : "Category added successfully"
        );
        setTimeout(() => {
          navigate("/categories"); // Redirect after success
        }, 150);
      } else {
        toast.error(response?.message || "Failed to save category");
      }
    } catch (err) {
      toast.error("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/categories")}
            className="text-white p-2 rounded-md hover:opacity-90 transition bg-slate-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 flex-1 text-center">
            {categoryId ? "Edit Category" : "Add Category"}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading Category...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryData.title}
                onChange={(e) =>
                  setCategoryData({ ...categoryData, title: e.target.value })
                }
                placeholder="Enter title"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#529fb7]"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-md">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/categories")}
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
                  : categoryId
                  ? "Update Category"
                  : "Add Category"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CategoryAddEdit;
