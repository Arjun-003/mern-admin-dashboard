import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useApi from "../api/hooks/useApi.jsx";
import ApiEndPoint from "../api/Constants/ApiEndPoint";
import { toast } from "react-toastify";
import { decrypt } from "../utils/webCrypto";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthProvider.jsx";
const Login = () => {

  const { login } = useAuth();
  const navigate = useNavigate();
  const { postDataWithOutToken, loading } = useApi();
  const [serverError, setServerError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Remember Me – Auto-Fill
  useEffect(() => {
    const stored = localStorage.getItem("rememberedLogin");
    if (stored) {
      decrypt(stored)
        .then((data) => {
          setEmail(data.email);
          setPassword(data.password);
        })
        .catch(() => console.warn("Invalid stored data"));
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    setEmailError("");
    setPasswordError("");
    setServerError("");

    // Required checks
    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }
    if (!valid) return;
    try {
      const payload = { email, password };
      const res = await postDataWithOutToken(ApiEndPoint.LOGIN, payload);

      if (res) {
        const { token, user } = res;
        login(user, token);
        toast.success(res.message);
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (error) {
      const backendMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed";
      setServerError(backendMessage);
    }


  };

  return (
    <div className="w-screen h-screen bg-yellow-50 flex items-center justify-center px-6">

      {/* Main container */}
      <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* LEFT SIDE LOGO */}
        <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
          <img
            src="logo.png"
            className="w-52 saturate-150"
            alt="Logo"
          />
        </div>


        {/* RIGHT SIDE LOGIN */}
        <div className="w-full md:w-1/2 p-10">

          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Login
          </h1>

          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}
          <p className="text-gray-500 text-center mb-8">
            Enter your credentials
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 
              focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 
              focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl font-semibold text-white
            bg-yellow-400 hover:bg-yellow-500 transition-all duration-200"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );

};

export default Login;
