import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";
import { Tooltip } from "react-tooltip";


const CategoryView = () => {
  const { categoryId } = useParams(); // Get categoryId from URL params
  const navigate = useNavigate(); // Navigate function
  const { getDataByParams } = useApi(); // API hook to fetch data by params

  const [categoryData, setCategoryData] = useState({
    title: "",
    image: null, // Store image URL
  });

  const [loading, setLoading] = useState(!!categoryId); // Set loading state based on categoryId

  // Fetch Category data from API
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true); // Set loading to true while fetching data

        const response = await getDataByParams(
          ApiEndPoint.categoryDetail, // API endpoint to get category details
          categoryId
        );

        if (response?.success === true && response.data) {
          setCategoryData({
            title: response.data.title || "",
            image: response.data.image || null, // Set category title and image from API response
          });
        } else {
          toast.error("Failed to fetch Category data"); // Handle error fetching data
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching Category"); // Handle error fetching data
      } finally {
        setLoading(false); // Set loading to false after data fetching is complete
      }
    };

    if (categoryId) fetchCategory(); // Fetch data only if categoryId is available
  }, [categoryId]);

  // Construct full image URL if image exists
  const imageUrl = categoryData.image
    ? `${ApiEndPoint.IMAGE_BASE_URL}${categoryData.image}`
    : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/categories")} // Navigate to categories listing
            className="bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl text-center font-semibold text-gray-800 flex-1">
            View Category
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading Category...</p>
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
                value={categoryData.title}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
                placeholder="No title available"
              />
            </div>

            {/* Image */}
            {imageUrl ? (
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Image
                </label>
                <img
                  src={imageUrl}
                  alt="Category"
                  className="w-full max-w-xs h-auto rounded-md border"
                />
              </div>
            ) : (
              <div className="mt-4 text-gray-500">No image available</div>
            )}
          </div>
        )}
      </div>
      <Tooltip id="my-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
};

export default CategoryView;
