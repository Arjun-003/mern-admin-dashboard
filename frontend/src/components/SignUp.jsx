import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


const schema = z.object({
  name: z.string().min(3, "Minimum 3 characters"),

  email: z.string().email("Invalid email"),

  age: z.coerce.number().min(18, "Age must be 18+"),

  mobile_Number: z
    .string()
    .min(10, "Phone number must be 10 digits"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  confirmpassword: z.string(),
}).refine((data) => data.password === data.confirmpassword, {
  message: "Passwords do not match",
  path: ["confirmpassword"],
});

function SignUp() {
  const navigate = useNavigate();

  const {register,handleSubmit,formState:{ errors }} = useForm({resolver: zodResolver(schema),mode:"onChange",});

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {

    setLoading(true);
    try {
      const response = await api.post("/sign_up", data);
      localStorage.setItem("Mobile_Number", data.mobile_Number);
      navigate("/verify-otp");
      console.log("Signup successful:", response.data);
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Signup failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto mt-4 p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Sign Up
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="username"
          >
            Username
          </label>

          <input
            type="text"
            id="username"
            {...register("name")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter your username"
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="email"
          >
            Email
          </label>

          <input
            type="email"
            id="email"
            {...register("email")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter your email"
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="age"
          >
            Age
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            id="age"
            
            {...register("age")}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter your age"
          />

          {errors.age && (
            <p className="text-red-500 text-sm mt-1">
              {errors.age.message}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="phone"
          >
            Phone Number
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            id="phone"
            {...register("mobile_Number")}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter your phone number"
          />

          {errors.mobile_Number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.mobile_Number.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="password"
          >
            Password
          </label>

          {/* 1. Added relative wrapper to position the button absolutely */}
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              {...register("password")}
              // 2. Added pr-12 (padding-right) so text doesn't overflow behind the button
              className="w-full px-3 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              // 3. Absolute positioning with Tailwind classes
              className="absolute right-3 text-sm text-gray-500 hover:text-gray-700 focus:outline-none select-none"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {errors.password.message}
          </p>
        )}


        {/* Confirm Password */}
        <div className="mb-6">
          <label
            className="block text-gray-700 mb-2"
            htmlFor="confirmpassword"
          >
            Confirm Password
          </label>

          {/* 1. Added relative wrapper to position the button absolutely */}
          <div className="relative flex items-center">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmpassword"
              {...register("confirmpassword")}
              // 2. Added pr-12 (padding-right) so text doesn't overflow behind the button
              className="w-full px-3 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Confirm your password"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              // 3. Absolute positioning with Tailwind classes
              className="absolute right-3 text-sm text-gray-500 hover:text-gray-700 focus:outline-none select-none"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {errors.confirmpassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmpassword.message}
            </p>
          )}
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-all duration-200"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUp;
