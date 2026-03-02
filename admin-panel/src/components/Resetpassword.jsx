import React, { useState } from "react";
import useApi from "../api/hooks/useApi.jsx";
import { toast } from "react-toastify";
import ApiEndPoint from "../api/Constants/ApiEndPoint.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState("");
  const { putData } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmNewPasswordError("");
    setSuccess("");

    let valid = true;

    if (!oldPassword.trim()) {
      setOldPasswordError("Old password is required.");
      valid = false;
    }

    if (!newPassword.trim()) {
      setNewPasswordError("New password is required.");
      valid = false;
    }

    if (!confirmNewPassword.trim()) {
      setConfirmNewPasswordError("Confirm new password is required.");
      valid = false;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError("Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    try {
      const data = {
        currentPassword: oldPassword,
        newPassword: newPassword,
      };
      const response = await putData(ApiEndPoint.changePassword, data, false);

      if (response.code === 200) {
        toast.success("Password changed successfully");
        setSuccess("");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");

        // Clear localStorage data and redirect to login page, just like logout
        localStorage.removeItem("authData"); // Or you can use `localStorage.clear()` to clear all
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("storage")); // Ensure other components react to this change

        // Redirect to login page
        navigate("/login");
      } else {
        toast.error(response.message || "Failed to update password.");
      }
    } catch {
      toast.error("Server error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-6">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl grid md:grid-cols-2 border border-slate-200">
        {/* Left Image Section */}
        <div className="hidden md:flex items-center justify-center bg-slate-100 p-4">
          <img
            src="./changePassword.jpg"
            alt="Reset Password"
            className="w-full max-h-360px object-contain rounded-xl"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">
            Reset Your Password 🔐
          </h2>

          {success && (
            <div className="bg-emerald-100 text-emerald-600 rounded-xl px-4 py-2 text-sm mb-3 border border-emerald-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Old Password
              </label>

              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (e.target.value.trim()) setOldPasswordError("");
                }}
                className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Enter old password"
              />

              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-4 top-9 text-slate-500"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {oldPasswordError && (
                <p className="text-red-500 text-sm mt-1">{oldPasswordError}</p>
              )}
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>

              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (e.target.value.trim()) setNewPasswordError("");
                }}
                className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-9 text-slate-500"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {newPasswordError && (
                <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (e.target.value.trim()) setConfirmNewPasswordError("");
                }}
                className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Confirm new password"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-9 text-slate-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {confirmNewPasswordError && (
                <p className="text-red-500 text-sm mt-1">
                  {confirmNewPasswordError}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-xl font-semibold transition duration-300 hover:opacity-90 bg-slate-900"
              >
                Update Password
              </button>
            </div>
          </form>

          <p className="text-xs text-center text-slate-400 mt-4">
            Make sure your new password is strong and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
