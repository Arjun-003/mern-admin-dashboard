import { useState, useEffect, useContext, useRef } from "react";
import { User, Mail, Phone, Camera, Save, Edit3, X } from "lucide-react";
import useApi from "../api/hooks/useApi.jsx";
import { toast } from "react-toastify";
import ApiEndPoint from "../api/Constants/ApiEndPoint";
import { AuthContext } from "../context/AuthProvider.jsx";

const Profile = () => {
  const { putData } = useApi();
  const { user, updateUser } = useContext(AuthContext);

  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);// For image preview
  const [imageRemoved, setImageRemoved] = useState(false);// To track if image is removed
  const [imageError, setImageError] = useState(false);// To track if image failed to load
  const [successMessage, setSuccessMessage] = useState("");// For success feedback
  const [isLoading, setIsLoading] = useState(false);// To track loading state

  const [formData, setFormData] = useState({// Form data state
    imageFile: null,
    name: "",
    email: "",
    mobile_Number: "",
  });

  // Initialize form with user data and set preview
  useEffect(() => {
    if (user) {
      setFormData({
        imageFile: null,
        name: user.name || "",
        email: user.email || "",
        mobile_Number: user.mobile_Number || "",
      });

      if (user.profile_image) {
        setPreview(`http://localhost:5000/${user.profile_image}`);
      } else {
        setPreview(null);
      }
    }
  }, [user]);

  // Reset image error when preview changes
  useEffect(() => {
    setImageError(false);
  }, [preview]);

// Check if any changes were made
  const changed =
    formData.name !== (user?.name || "") ||
    formData.mobile_Number !== (user?.mobile_Number || "") ||
    formData.imageFile ||
    imageRemoved;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setImageRemoved(false);
    }
  };

  // Handle image removal
  const removeImage = () => {
    setPreview(null);
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImageRemoved(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!changed) return;

    try {
      setIsLoading(true);
      setSuccessMessage("");

      const fd = new FormData();
      if (formData.name !== user.name)
        fd.append("name", formData.name);

      if (formData.mobile_Number !== user.mobile_Number)
        fd.append("mobile_Number", formData.mobile_Number);

      if (formData.imageFile)
        fd.append("profile_image", formData.imageFile);

      if (imageRemoved)
        fd.append("removeImage", "true");
      const res = await putData(ApiEndPoint.updateProfile, fd);

      updateUser(res.data.user);
      console.log(res.data.user, 'updated user data');

      setSuccessMessage("Profile updated successfully!");
      setImageRemoved(false);
      setFormData((prev) => ({ ...prev, imageFile: null }));

      if (res.data.user.profile_image) {
        setPreview(`http://localhost:5000/${res.data.user.profile_image}`);
      } else {
        setPreview(null);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {// Generate initials from name
  if (!name) return "U";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  return (
    words[0][0].toUpperCase() +
    words[1][0].toUpperCase()
  );
};

  return (
    <div className="min-h-auto py-10">
      <div className="max-w-4xl mx-auto px-6">

        {successMessage && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-emerald-800 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-8 lg:space-y-0 lg:space-x-12">

              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4 lg:shrink-0">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-2xl border-4 border-slate-200 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">

                    {preview && !imageError ? (
                      <img
                        src={preview}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="text-3xl font-bold text-slate-700">
                        {getInitials(user?.name)}
                      </div>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-3 -right-3 w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Camera size={20} className="text-white" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {preview && (
                  <button
                    onClick={removeImage}
                    className="flex items-center space-x-2 text-slate-500 hover:text-red-500 text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <X size={16} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Form */}
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <User size={16} className="text-slate-600" />
                      </div>
                      Full Name
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all duration-200 bg-white hover:border-slate-300"
                        placeholder="Enter your full name"
                      />
                      <Edit3
                        size={18}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <Mail size={16} className="text-slate-600" />
                      </div>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                      <Phone size={16} className="text-slate-600" />
                    </div>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="mobile_Number"
                    value={formData.mobile_Number}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all duration-200"
                  />
                </div>

                {/* Save */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !changed}
                    className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;