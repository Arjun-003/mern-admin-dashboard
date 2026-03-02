import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

const UserReportsView = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(!!reportId);
  const { getDataByParams } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(
          ApiEndPoint.userReportDetail,
          reportId
        );
        if (response?.code === 200 && response.body) {
          setReport(response.body || null);
        } else {
          toast.error("Failed to fetch report data");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching report data");
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchData();
    }
  }, [reportId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto mt-3">
      <div className="mb-8">
        <button
          onClick={() => navigate("/userReports_listing")}
          className="bg-gray-800 text-white p-2 rounded-md mb-4 cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl text-center font-medium text-gray-700">
          View User Report
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin h-6 w-6 mx-auto mb-2 border-4 border-blue-500 border-t-transparent rounded-full" />
          Loading Data...
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Reported By */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Reported By
            </label>
            <input
              type="text"
              value={report.reportedByUser?.fullName || "N/A"}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-800 cursor-not-allowed"
            />
          </div>

          {/* Reported To */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Reported To
            </label>
            <input
              type="text"
              value={report.reportedToUser?.fullName || "N/A"}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-800 cursor-not-allowed"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Reason
            </label>
            <textarea
              value={report.reason || "N/A"}
              disabled
              rows={4}
              className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-800 cursor-not-allowed resize-none"
            />
          </div>

          {/* Created At */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Created At
            </label>
            <input
              type="text"
              value={
                report.createdAt
                  ? new Date(report.createdAt).toLocaleString()
                  : "N/A"
              }
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-800 cursor-not-allowed"
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Report not found</div>
      )}
    </div>
  );
};

export default UserReportsView;
