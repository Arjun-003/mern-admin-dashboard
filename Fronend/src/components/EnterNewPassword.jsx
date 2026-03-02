import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const EnterNewPassword = () => {
    const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL
  const token = new URLSearchParams(location.search).get("token");

  const [formData, setFormData] = React.useState({
    newPassword: "",
    confirmnewpassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmnewpassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await api.post("/reset-password", {
        token,
        newPassword: formData.newPassword,
        confirmnewpassword: formData.confirmnewpassword,
      });
      navigate('/login');
      console.log(response.data);
      alert("Password reset successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to reset password");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-36 p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Set Your New Password Carefully
        </h2>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Enter New Password :</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter New Password"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Confirm New Password :
          </label>
          <input
            type="password"
            name="confirmnewpassword"
            value={formData.confirmnewpassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Confirm New Password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-all duration-200"
        >
          Set New Password
        </button>
      </form>
    </div>
  );
};

export default EnterNewPassword;
