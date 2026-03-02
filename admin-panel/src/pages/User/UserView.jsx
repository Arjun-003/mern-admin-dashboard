import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

const UserView = () => {
  const { userId } = useParams();
  console.log(userId);
  const navigate = useNavigate();
  const { getDataByParams } = useApi();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(!!userId);

  const getInitials = (name = "") => {
    return name.split(" ").join("").substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await getDataByParams(ApiEndPoint.userDetail, userId);

        console.log("API RESPONSE 👉", response.data);

        if (response?.success && response?.data) {
          setUserData(response.data); // ✅ CORRECT
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("User detail error:", error);
        toast.error("Something went wrong while fetching user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetail();
  }, [userId]);



  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-5xl mx-auto mt-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/users_listing")}
          className="bg-gray-800 text-white p-2 rounded-md"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-gray-700">Member Details</h1>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-spin h-7 w-7 mx-auto mb-2 border-4 border-blue-500 border-t-transparent rounded-full" />
          Loading member data...
        </div>
      ) : (
        <>
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-8 relative">
            {userData?.profile_image ? (
              <div className="relative">
                <img
                  src={`${ApiEndPoint.IMAGE_BASE_URL}/${userData.profile_image}`}
                  alt="User"
                  className="w-32 h-32 rounded-full object-cover border"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-3xl font-semibold text-gray-700">
                  {getInitials(userData?.name || "NA")}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                disabled
                value={userData?.name || ""}
                className="w-full bg-gray-100 border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                disabled
                value={userData?.email || ""}
                className="w-full bg-gray-100 border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Phone
              </label>
              <input
                disabled
                value={`${userData?.mobile_Number || ""
                }`}
                className="w-full bg-gray-100 border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Age
              </label>
              <input
                disabled
                value={userData?.age || "N/A"}
                className="w-full bg-gray-100 border rounded-md px-3 py-2"
              />
            </div>            
          </div>
        </>
      )}
    </div>
  );
};

export default UserView;
