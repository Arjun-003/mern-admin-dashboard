import React, { useEffect, useState } from "react";
import { ArrowLeft, Star, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

// Simple inline modal with blurred transparent background
const SimpleModal = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
                    bg-opacity-50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            X
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const ProviderView = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams } = useApi();

  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(!!providerId);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null); // for modal
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchProviderDetail = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(
          ApiEndPoint.providerDetail,
          providerId,
        );

        if (response?.success && response?.body) {
          const provider = response.body;
          setProviderData(provider);

          // Set ratings and average
          const providerRatings = provider.ratings || [];
          setRatings(providerRatings);
          const avg =
            providerRatings.length > 0
              ? providerRatings.reduce((sum, r) => sum + r.rating, 0) /
                providerRatings.length
              : 0;
          setAverageRating(avg.toFixed(1));
        } else {
          toast.error("Failed to fetch provider details");
        }
      } catch (error) {
        console.error("Provider detail error:", error);
        toast.error("Something went wrong while fetching provider");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchProviderDetail();
  }, [providerId]);

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 0:
        return "Male";
      case 1:
        return "Female";
      case 2:
        return "Other";
      default:
        return "N/A";
    }
  };

  const getBadgeLabel = (badge) => {
    switch (badge) {
      case 0:
        return "Normal";
      case 1:
        return "Verified";
      case 2:
        return "Featured";
      default:
        return "N/A";
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 0:
        return "bg-gray-200 text-gray-700";
      case 1:
        return "bg-blue-500 text-white";
      case 2:
        return "bg-yellow-400 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-6xl mx-auto mt-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/providers_listing")}
          className="bg-gray-800 text-white p-2 rounded-md"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-gray-700">Host Details</h1>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-spin h-7 w-7 mx-auto mb-2 border-4 border-blue-500 border-t-transparent rounded-full" />
          Loading host data...
        </div>
      ) : (
        <>
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8">
            {providerData?.profilePicture ? (
              <img
                src={`${ApiEndPoint.baseUrl}${providerData.profilePicture}`}
                alt="Provider"
                className="w-32 h-32 rounded-full object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-4xl font-semibold text-gray-700">
                  {providerData?.fullName?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
            )}
            {/* Badge */}
            <span
              className={`mt-2 px-4 py-1 rounded-full text-sm font-medium ${getBadgeColor(
                providerData?.profileBadge,
              )}`}
            >
              {getBadgeLabel(providerData?.profileBadge)}
            </span>
          </div>

          {/* Govt ID */}
          {providerData?.govtId && (
            <div className="mt-8 text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Government ID
              </h2>

              <div className="flex justify-center">
                <a
                  href={`${ApiEndPoint.baseUrl}${providerData.govtId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`${ApiEndPoint.baseUrl}${providerData.govtId}`}
                    alt="Government ID"
                    className="w-64 h-40 object-cover rounded-md border shadow-sm hover:opacity-90 transition"
                  />
                </a>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Click image to view full size
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                disabled
                value={providerData?.fullName || ""}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                disabled
                value={providerData?.email || ""}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Phone
              </label>
              <input
                disabled
                value={`${providerData?.countryCode || ""} ${
                  providerData?.phoneNumber || ""
                }`}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Location
              </label>
              <input
                disabled
                value={providerData?.location || "N/A"}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Category
              </label>
              <input
                disabled
                value={providerData?.category?.title || "N/A"}
                className="w-full bg-gray-100 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div className="mt-8">
            <label className="block mb-2 font-medium text-gray-700 text-center">
              Short Bio
            </label>
            <textarea
              disabled
              rows={4}
              value={providerData?.shortBio || "No bio available"}
              className="w-full bg-gray-100 rounded-md px-3 py-2 resize-none"
            />
          </div>

          {/* Activities */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Activities
            </h2>
            {providerData?.userActivities?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {providerData.userActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border rounded-md p-4 flex flex-col items-center bg-gray-50"
                  >
                    <p className="font-medium text-gray-800 mb-1 text-center">
                      {activity.activity?.title}
                    </p>

                    {/* Hourly Rate */}
                    <p className="text-sm text-gray-600 mb-1">
                      Hourly Rate: ${activity.hourlyRate || 0}
                    </p>

                    {/* Vibe */}
                    {activity.vibe && (
                      <p className="text-sm text-gray-600 mb-1">
                        Vibe: {activity.vibe}
                      </p>
                    )}

                    {/* Tags */}
                    {activity.tags && (
                      <p className="text-sm text-gray-600 mb-1">
                        Tags: {activity.tags}
                      </p>
                    )}

                    {/* Min Session Duration */}
                    {activity.minSessionDuration && (
                      <p className="text-sm text-gray-600 mb-1">
                        Min Session Duration: {activity.minSessionDuration}
                      </p>
                    )}

                    {/* What we do together */}
                    {activity.whatWellDoTogether && (
                      <p className="text-sm text-gray-600 mb-2 text-center">
                        {activity.whatWellDoTogether}
                      </p>
                    )}

                    {/* Images */}
                    {activity.images?.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-center mt-2">
                        {activity.images.map((img) => (
                          <img
                            key={img.id}
                            src={`${ApiEndPoint.IMAGE_BASE_URL}${img.image}`}
                            alt="Activity"
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No activities added</p>
            )}
          </div>

          {/* Availability */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Availability
            </h2>
            {providerData?.availabilities?.length > 0 ? (
              <div className="flex flex-col gap-4 items-center">
                {providerData.availabilities.map((avail) => (
                  <div key={avail.id} className="flex gap-4">
                    <span className="font-medium">{avail.date}</span>
                    <div className="flex gap-2 flex-wrap">
                      {avail.times.map((time) => (
                        <span
                          key={time.id}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          {time.time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No availability added</p>
            )}
          </div>

          {/* Taglines */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Taglines
            </h2>
            {providerData?.userTaglines?.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {providerData.userTaglines.map((item) => (
                  <span
                    key={item.id}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm"
                  >
                    {item?.tagline?.title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No taglines added</p>
            )}
          </div>

          {/* Ratings Section */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Ratings & Reviews
            </h2>
            <div className="flex justify-center items-center mb-4 gap-2 text-gray-800">
              <span className="text-2xl font-bold">{averageRating}</span>
              <Star className="text-yellow-400" />
              <span className="text-sm text-gray-500">
                ({ratings.length} reviews)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rated By
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ratings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-3 text-center text-gray-500"
                      >
                        No ratings yet
                      </td>
                    </tr>
                  ) : (
                    ratings.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {r.user?.fullName || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 flex items-center gap-1">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="text-yellow-400"
                              size={16}
                            />
                          ))}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                          {r.description || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {r.description && r.description.length > 50 && (
                            <button
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              onClick={() => {
                                setSelectedRating(r);
                                setModalOpen(true);
                              }}
                            >
                              <Eye size={16} /> View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rating Modal */}
          {modalOpen && selectedRating && (
            <SimpleModal
              title={`Review by ${selectedRating.user?.fullName}`}
              onClose={() => setModalOpen(false)}
            >
              <p className="text-gray-800">{selectedRating.description}</p>
            </SimpleModal>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderView;
