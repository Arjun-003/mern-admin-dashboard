import{ useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Users,
  Briefcase,
  CalendarCheck,
  
} from "lucide-react";
import useApi from "../api/hooks/useApi";
import ApiEndPoint from "../api/Constants/ApiEndPoint";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getData } = useApi();

  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState({
    userCount: 0,
    sellerCount: 0,
    productCount: 0,
   

  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getData(ApiEndPoint.DASHBOARD_DATA);
        if (response?.body) setStatsData(response.body);
        console.log(response, "Dashboard response");
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData()
  }, [])





  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

const stats = [
  {
    title: "Users",
    count: statsData.userCount,
    icon: <Users size={20} />,
    path: "/users_listing",
  },
  {
    title: "Sellers",
    count: statsData.sellerCount,
    icon: <Briefcase size={20} />,
    path: "/providers_listing",
  },
  {
    title: "Products",
    count: statsData.productCount,
    icon: <CalendarCheck size={20} />,
    path: "/products_listing",
  }
];

  return (
    <div className="p-9 space-y-14">
      <ToastContainer position="top-right" autoClose={3000} />



      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={() => navigate(s.path)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md cursor-pointer hover:bg-gray-50"
          >
            <div className="p-3 bg-[#1c1c1c] text-[#e6a10e] rounded-full">
              {s.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{s.count}</h3>
              <p className="text-sm text-gray-600">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
     

    </div>
  );
};

export default Dashboard;
