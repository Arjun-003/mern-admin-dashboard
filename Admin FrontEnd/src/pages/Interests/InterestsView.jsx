import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

const videoTypes = [
  { id: 0, label: "Highlights" },
  { id: 1, label: "Tutorials" },
  { id: 2, label: "Replays" },
];

const InterestsView = () => {
  const { interestId } = useParams();
  const navigate = useNavigate();
  const { getDataByParams } = useApi();

  const [interestData, setInterestData] = useState({ title: "", image: null });
  const [videos, setVideos] = useState({ 0: [], 1: [], 2: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterestAndVideos = async () => {
      try {
        setLoading(true);

        // Fetch interest details
        const interestRes = await getDataByParams(
          ApiEndPoint.interestDetail,
          interestId
        );
        if (interestRes?.success) {
          setInterestData({
            title: interestRes.data.title || "",
            image: interestRes.data.image || null,
          });
        }

        // Fetch videos
        const videosRes = await getDataByParams(
          ApiEndPoint.interestVideos,
          interestId
        );
        if (videosRes?.success && videosRes.data) {
          const grouped = { 0: [], 1: [], 2: [] };
          videosRes.data.forEach((video) => {
            grouped[video.videoType].push(video);
          });
          setVideos(grouped);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch interest details or videos");
      } finally {
        setLoading(false);
      }
    };

    if (interestId) fetchInterestAndVideos();
  }, [interestId]);

  const imageUrl = interestData.image
    ? `${ApiEndPoint.IMAGE_BASE_URL}${interestData.image}`
    : null;

  const renderVideo = (video) => (
    <div key={video.id} className="mb-2">
      <video
        src={`${ApiEndPoint.IMAGE_BASE_URL}${video.video}`}
        controls
        className="w-48 h-28 object-cover rounded-md border"
      />
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/interests")}
            className="bg-gray-800 text-white p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl text-center font-semibold text-gray-800 flex-1">
            View Interest
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 mx-auto mb-3 border-4 border-[#529fb7] border-t-transparent rounded-full" />
            <p>Loading...</p>
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
                value={interestData.title}
                disabled
                className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-50 text-gray-800 cursor-not-allowed"
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
                  alt="Interest"
                  className="w-full max-w-xs h-auto rounded-md border"
                />
              </div>
            ) : (
              <div className="mt-4 text-gray-500">No image available</div>
            )}

            {/* Videos */}
            {videoTypes.map((type) => (
              <div key={type.id} className="mt-6">
                <h2 className="text-lg font-semibold mb-2">{type.label}</h2>
                {videos[type.id]?.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {videos[type.id].map(renderVideo)}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No {type.label.toLowerCase()} videos
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestsView;
