import { useState, useEffect, useRef, useContext } from "react";
import { User, Settings, LogOut } from "lucide-react";
import Swal from "sweetalert2";
// Use Api and EndPoints 
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// Auth of user and token
import { AuthContext } from "../../context/AuthProvider.jsx";
const Navbar = () => {
  const { user, token, logout, loading } = useContext(AuthContext);
  const [greeting, setGreeting] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else if (hour < 22) setGreeting("Good Evening");
      else setGreeting("Welcome Back");
    };
    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return null; // or a loading spinner, or redirect to login
  }

  // Logout
  const handleLogout = () => {
    setDropdownOpen(false);
    Swal.fire({
      title: "Logout",
      html: '<div style="color: #6b7280; font-size: 15px; margin-top: 8px;">This will end your session</div>',
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "minimal-popup",
        title: "minimal-title",
        htmlContainer: "minimal-text",
        actions: "minimal-actions",
        confirmButton: "minimal-confirm-btn",
        cancelButton: "minimal-cancel-btn",
      },
      backdrop: `rgba(0,0,0,0.4)`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        logout();
        toast.success("Logout Successfully");

        setTimeout(() => {
          navigate("/login");
        }, 300);
      }
    });
  };

  return (
    <>
      <div className="w-full flex justify-center mt-4">
        <div className="w-1/2 backdrop-blur-lg bg-gray-900/40 rounded-2xl shadow-xl flex justify-between items-center px-6 py-3">
          <div className="text-xl font-bold text-white">
            {greeting}, {user?.name || "Admin"}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-full transition"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30">
                {user.profile_image ? (
                  <img
                    src={`${ApiEndPoint.IMAGE_BASE_URL}${user.profile_image}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </div>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl z-50 animate-dropdown"
                style={{ animation: "dropdownIn 0.3s forwards" }}
              >
                {[
                  {
                    label: "Profile",
                    icon: <User size={16} />,
                    action: () => {
                      setDropdownOpen(false);
                      navigate(`/profile`);
                    },
                  },
                  {
                    label: "Reset Password",
                    icon: <Settings size={16} />,
                    action: () => {
                      setDropdownOpen(false);
                      navigate(`/resetPassword`);
                    },
                  },
                  {
                    label: "Logout",
                    icon: <LogOut size={16} />,
                    color: "text-red-600",
                    action: handleLogout,
                  },

                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}

                    className={`w-full flex items-center px-4 py-2 text-sm hover:scale-105 transition-transform ${item.color ? item.color : "text-gray-700"
                      }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>
          {`
  @keyframes dropdownIn {
    0% { opacity: 0; transform: scale(0.95) rotateX(10deg); }
    100% { opacity: 1; transform: scale(1) rotateX(0deg); }
  }

  .minimal-confirm-btn {
    background-color: #ef4444 !important; /* red-500 */
    color: white !important;
    padding: 8px 22px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    margin-right: 10px !important;
  }

  .minimal-cancel-btn {
    background-color: #d1d5db !important; /* gray-300 */
    color: #374151 !important;            /* gray-700 */
    padding: 8px 22px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
  }

  .minimal-actions {
    display: flex !important;
    justify-content: center !important;
    gap: 10px !important;
    margin-top: 15px !important;
  }
`}
        </style>
      </div>
    </>
  );
};

export default Navbar;
