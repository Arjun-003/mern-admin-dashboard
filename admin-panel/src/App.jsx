import "./App.css";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";

import LayoutWrapper from "./components/layout/LayoutWrapper";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./components/Profile";
import Resetpassword from "./components/Resetpassword";
import UserList from "./pages/User/UserList";
import AboutUs from "./pages/CMS/AboutUs";
import PrivacyPolicy from "./pages/CMS/Privacy";
import TermsAndCondition from "./pages/CMS/TermsAndCondition";
import ConstactUsList from "./pages/ContactUs/ContactUsList";
import ContactUsView from "./pages/ContactUs/ContactUsView";
import UserView from "./pages/User/UserView";
import FaqList from "./pages/Faq/FaqList";
import FaqAddEdit from "./pages/Faq/FaqAddEdit";
import FaqView from "./pages/Faq/FaqView";
import InterestsList from "./pages/Interests/InterestsList";
import InterestsView from "./pages/Interests/InterestsView";
import InterestsAddEdit from "./pages/Interests/InterestsAddEdit";
import CategoryList from "./pages/Category/CategoryList";
import CategoryView from "./pages/Category/CategoryView";
import CategoryAddEdit from "./pages/Category/CategoryAddEdit";
import SellerList from "./pages/Seller/SellerList";
import SellerView from "./pages/Seller/SellerView";
import SubscriptionList from "./pages/Subscription/SubscriptionList";
import SubscriptionAddEdit from "./pages/Subscription/SubscriptionAddEdit";
import SubscriptionView from "./pages/Subscription/SubscriptionView";
import PushNotificationAdd from "./pages/PushNotification/PushNotificationAdd";
import UserReportsList from "./pages/UserReports/UserReportsList";
import UserReportsView from "./pages/UserReports/UserReportsView";
import ProductDetail from "./pages/Products/ProductsDetail";
import ProductsView from "./pages/Products/ProductView";

import ProtectedRoute from "./ProtectedRoutes";

import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>

          <Route
            element={
              <LayoutWrapper
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
              />
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resetPassword" element={<Resetpassword />} />
            <Route path="/users_listing" element={<UserList />} />
            <Route path="/users_view/:userId" element={<UserView />} />

            <Route path="/Seller_listing" element={<SellerList />} />
            <Route
              path="/sellers_view/:sellerId"
              element={<SellerView />}
            />

            <Route path="/products_listing" element={<ProductDetail />} />
            <Route
              path="/product_view/:productId"
              element={<ProductsView />}
            />

            <Route path="/interests" element={<InterestsList />} />
            <Route
              path="/interest_view/:interestId"
              element={<InterestsView />}
            />
            <Route path="/interest_add" element={<InterestsAddEdit />} />
            <Route
              path="/interest_edit/:interestId"
              element={<InterestsAddEdit />}
            />



            <Route path="/userReports_listing" element={<UserReportsList />} />
            <Route
              path="/userReports_view/:reportId"
              element={<UserReportsView />}
            />



            <Route
              path="/push-notifications"
              element={<PushNotificationAdd />}
            />

            <Route path="/faq" element={<FaqList />} />
            <Route path="/faq_view/:faqId" element={<FaqView />} />
            <Route path="/faq_add" element={<FaqAddEdit />} />
            <Route path="/faq_edit/:faqId" element={<FaqAddEdit />} />

            <Route path="/categories" element={<CategoryList />} />
            <Route
              path="/category_view/:categoryId"
              element={<CategoryView />}
            />
            <Route path="/category_add" element={<CategoryAddEdit />} />
            <Route
              path="/category_edit/:categoryId"
              element={<CategoryAddEdit />}
            />

            <Route path="/subscriptions" element={<SubscriptionList />} />
            <Route
              path="/subscription_view/:subscriptionId"
              element={<SubscriptionView />}
            />
            <Route path="/subscription_add" element={<SubscriptionAddEdit />} />
            <Route
              path="/subscription_edit/:subscriptionId"
              element={<SubscriptionAddEdit />}
            />

            <Route path="/contactUs_listing" element={<ConstactUsList />} />
            <Route
              path="/contactUs_view/:contactUsId"
              element={<ContactUsView />}
            />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/termsAndCondition" element={<TermsAndCondition />} />
            {/* Redirect all unmatched routes to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={1000} />
    </>
  );
}

export default App;
