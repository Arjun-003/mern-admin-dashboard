import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Main from "./components/Main.jsx";
import Login from "./components/LogIn.jsx";
import OtpSent from "./components/OtpSent.jsx";
import SignUp from "./components/SignUp.jsx";
import ForgetPassword from "./components/ForgetPassword.jsx";
import EnterNewPassword from "./components/EnterNewPassword.jsx";
import Profile from "./components/Profile.jsx";
import PostCategories from "./components/PostCategories.jsx";
import PostItemDetail from "./components/PostItemDetail.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import ChatBox from "./components/ChatBox.jsx";
import MainLayout from "./components/MainLayout.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

import { ProtectedRoute } from "./ProtectedRoutes.jsx";
function App() {



  return (

    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/verify-otp" element={<OtpSent />} />
      {/* Forget Password Routes */}
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/enter-password" element={<EnterNewPassword />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Main />} />
        <Route path="/item-detail/:id" element={<ProductDetail />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* 🔴 Routes WITHOUT Header */}
        <Route path="/profile" element={<Profile />} />
        {/* Post Routes */}
        <Route path="/post-categories" element={<PostCategories />} />
        <Route path="/post-item-detail" element={<PostItemDetail />} />

        {/* Chat Routes */}
        <Route path="/chat-window/:receiverId/:productId" element={<ChatWindow />} />
        <Route path="/chat-box" element={<ChatBox />} />
      </Route>
    </Routes>
  );
}

export default App;
