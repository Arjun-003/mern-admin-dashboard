import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  HelpCircle,
  Info,
  ShieldCheck,
  MessageCircleQuestion,
  Heart,
  Folder,
  Tag,
  Activity,
  Briefcase,
  CreditCard,
  CalendarCheck,
  Bell,
  AlertTriangle,
  Receipt,
} from "lucide-react";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  // Check if any of the routes array matches current path
  const isActive = (routes) => {
    const currentPath = location.pathname;

    // If routes is a string, convert to array
    const routeArray = Array.isArray(routes) ? routes : [routes];

    return routeArray.some((route) => {
      // Check exact match
      if (currentPath === route) return true;

      // Check if current path starts with route (for dynamic params like /users_view/:userId)
      if (currentPath.startsWith(route + "/")) return true;

      return false;
    });
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white/95 shadow-2xl z-30 transition-all duration-500 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div
        onClick={toggleSidebar}
        className="flex items-center justify-center p-3 cursor-pointer"
      >
        <div className="w-36 h-25 overflow-hidden">
          {" "}
          <img
            src="./logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Menu */}
      <div
        className="overflow-y-auto hide-scrollbar"
        style={{
          height: "calc(100vh - 80px)",
        }}
      >
        <ul className="space-y-1 px-3 py-4">
          {[
            {
              to: "/dashboard",
              routes: ["/dashboard"],
              icon: <Home />,
              label: "Dashboard",
            },
            {
              to: "/users_listing",
              routes: ["/users_listing", "/users_edit", "/users_view"],
              icon: <Users />,
              label: "Users",
            },
            {
              to: "/providers_listing",
              routes: [
                "/providers_listing",
                "/providers_edit",
                "/providers_view",
              ],
              icon: <Briefcase />,
              label: "Sellers",
            },
            {
              to: "/bookings_listing",
              routes: ["/bookings_listing", "/bookings_view"],
              icon: <CalendarCheck />,
              label: "Products",
            },
            {
              to: "/push-notifications",
              routes: ["/push-notifications"],
              icon: <Bell />,
              label: "Push Notifications",
            },
            {
              to: "/interests",
              routes: [
                "/interests",
                "/interest_Add",
                "/interest_Edit",
                "/interest_view",
                "/interest_videos",
              ],
              icon: <Heart />,
              label: "Interests",
            },
            {
              to: "/subscriptions",
              routes: [
                "/subscriptions", // List page
                "/subscription_add", // Add page
                "/subscription_edit", // Edit page
                "/subscription_view", // View page
              ],
              icon: <CreditCard />, // You can use any icon you like from lucide-react
              label: "Subscriptions",
            },
            {
              to: "/categories",
              routes: [
                "/categories",
                "/category_add",
                "/category_edit",
                "/category_view",
              ],
              icon: <Folder />,
              label: "Categories",
            },
            {
              to: "/taglines",
              routes: [
                "/taglines",
                "/tagline_add",
                "/tagline_edit",
                "/tagline_view",
              ],
              icon: <Tag />,
              label: "Taglines",
            },

            {
              to: "/activities",
              routes: [
                "/activities",
                "/activity_add",
                "/activity_edit",
                "/activity_view",
              ],
              icon: <Activity />,
              label: "Activities",
            },
            {
              to: "/transactions",
              routes: [
                "/transactions",
              ],
              icon: <Receipt />,
              label: "Transactions",
            },
            {
              to: "/userReports_listing",
              routes: ["/userReports_listing", "/userReports_view"],
              icon: <AlertTriangle />, // or any icon you prefer
              label: "User Reports",
            },
            {
              to: "/faq",
              routes: ["/faq", "/faq_add", "/faq_edit", "/faq_view"],
              icon: <MessageCircleQuestion />,
              label: "FAQs",
            },
            {
              to: "/contactUs_listing",
              routes: ["/contactUs_listing", "/contactUs_view"],
              icon: <HelpCircle />,
              label: "Contact Us",
            },
            {
              to: "/aboutUs",
              routes: ["/aboutUs"],
              icon: <Info />,
              label: "About Us",
            },
            {
              to: "/privacyPolicy",
              routes: ["/privacyPolicy"],
              icon: <ShieldCheck />,
              label: "Privacy Policy",
            },
            {
              to: "/termsAndCondition",
              routes: ["/termsAndCondition"],
              icon: <FileText />,
              label: "Terms & Condition",
            },
          ].map((item, index) => (
            <li key={index}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 transform-gpu ${
                  isActive(item.routes)
                    ? "bg-[#111111] text-white scale-105 shadow-lg"
                    : "text-gray-700 hover:bg-[#f2f2f2] hover:scale-105"
                }`}
              >
                {/* Icon */}
                <span
                  className={`transition-all duration-300 ${
                    sidebarOpen ? "text-[18px]" : "text-[28px]"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Label with animation */}
                <span
                  className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${
                    sidebarOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                  style={{
                    display: sidebarOpen ? "inline-block" : "inline-block",
                    pointerEvents: sidebarOpen ? "auto" : "none",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
          <li className="h-6"></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
