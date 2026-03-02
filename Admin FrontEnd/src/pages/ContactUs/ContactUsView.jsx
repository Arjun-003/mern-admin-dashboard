import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

const ContactUsView = () => {
  const { contactUsId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getDataByParams } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(
          ApiEndPoint.contactUsView,
          contactUsId
        );

        if (response?.code === 200 && response.body) {
          setData(response.body);
        } else {
          toast.error("Failed to fetch contact data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (contactUsId) fetchData();
  }, [contactUsId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto mt-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/contactUs_listing")}
          className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-700">View Contact Us</h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              value={data?.name || "N/A"}
              disabled
              className="w-full bg-gray-100 border rounded px-3 py-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              value={data?.email || "N/A"}
              disabled
              className="w-full bg-gray-100 border rounded px-3 py-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Phone Number
            </label>
            <input
              value={
                `${data?.countryCode || ""}${data?.phoneNumber || ""}` || "N/A"
              }
              disabled
              className="w-full bg-gray-100 border rounded px-3 py-2"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={data?.message || "N/A"}
              disabled
              rows={4}
              className="w-full bg-gray-100 border rounded px-3 py-2 resize-none"
            />
          </div>

          {/* Created At */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Created At
            </label>
            <input
              value={
                data?.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "N/A"
              }
              disabled
              className="w-full bg-gray-100 border rounded px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUsView;
