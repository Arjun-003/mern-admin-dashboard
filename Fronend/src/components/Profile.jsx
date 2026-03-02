import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";


const Profile = () => {

  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useContext(AuthContext); //Authenicated data 
  const [product, setProduct] = useState([]) // product data of user 
  const [isEditing, setIsEditing] = useState(false); // for Disabling Enabling the fields 
  const [imageError, setImageError] = useState(false);
  // For Image Preview and Removing the image
  const [preview, setPreview] = useState(null); // For Image to show if the Image of user Available
  const [imageRemoved, setImageRemoved] = useState(false); // To check if image is removed


  const [formData, setFormData] = useState({ // updating the Data of the user 
    imageFile: null,
    name: "",
    email: "",
    mobile_Number: "",
  });
  // Setting the Data of the user in the form when the user data is available and also setting the preview of the image if available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_Number: user.mobile_Number || "",
        imageFile: null
      });

      if (user.profile_image) {
        setPreview(`http://localhost:5000/${user.profile_image}`);
      } else {
        setPreview(null);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchMyProducts = async () => {
      try {
        const res = await api.get(`/myProducts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProduct(res.data);
      } catch (error) {
        console.error("Fetch my products error:", error);
      }
    };
    fetchMyProducts();
  }, [user, token]);

  // Getting the Input values of Users
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }
    ))
  }

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const isNameChanged = formData.name.trim() !== (user.name || "").trim();
    const isPhoneChanged = formData.mobile_Number !== user.mobile_Number;
    const isImageChanged = !!formData.imageFile;
    const isImageRemoved = imageRemoved === true;
    if (!isNameChanged && !isPhoneChanged && !isImageChanged && !isImageRemoved) {
      setIsEditing(false);
      return;
    }
    try {
      const fd = new FormData();
      if (isNameChanged) fd.append("name", formData.name);
      if (isPhoneChanged) fd.append("mobile_Number", formData.mobile_Number);
      if (isImageChanged) fd.append("profile_image", formData.imageFile);
      // Removed Image from Formdata
      if (isImageRemoved) fd.append("removeImage", "true");
      console.log(fd, 'Here is the data');
      const res = await api.put("/profile/update", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      updateUser(res.data.user);
      setPreview(
        res.data.user.profile_image
          ? `http://localhost:5000/${res.data.user.profile_image}`
          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      );
      setImageRemoved(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="flex justify-left mt-16 px-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
        {/* Profile Image Upload */}
        <div className="flex ">
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/*"
            disabled={!isEditing}
            onChange={handleImage}
          />
          <div className="relative">
            {preview && !imageError ? (
              <img
                src={preview}
                alt={user?.name || "User"}
                className={`w-32 h-32 rounded-full object-cover border-4 ${isEditing ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                onClick={() =>
                  isEditing && document.getElementById("fileInput").click()
                }
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                onClick={() =>
                  isEditing && document.getElementById("fileInput").click()
                }
                className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-gray-400 text-white text-3xl font-bold ${isEditing ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
              >
                {`${user?.name?.charAt(0)?.toUpperCase()}${user?.name?.split(" ")[1]?.charAt(0)?.toUpperCase() || ""}`}
              </div>
            )}
          </div>
          <button
            type="button"
            className={`${user?.profile_image && isEditing ? 'bg-red-600 h-7 px-3 text-white text-sm rounded mt-12 ml-4' : 'bg-slate-300 cursor-not-allowed h-7 px-3 text-white text-sm rounded mt-12 ml-4'}`}
            disabled={!isEditing}
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                imageFile: null,
              }));
              setPreview(null);
              setImageRemoved(true);
              setImageError(false);
            }}
          >
            Remove Photo
          </button>


        </div>

        {/* Name */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            name="name"
            disabled={!isEditing}
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isEditing ? "bg-white" : "bg-gray-300 cursor-not-allowed"}`}
          />
          {/* Phone Number */}
          <input
            type="text"
            name="mobile_Number"
            disabled={!isEditing}
            value={formData.mobile_Number}
            onChange={handleChange}
            placeholder="Phone Number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isEditing ? "bg-white" : "bg-gray-300 cursor-not-allowed"}`}
          />
          {/* Email */}
          <input
            type="email"
            name="email"
            disabled={true}
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-300 cursor-not-allowed`}
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-2 rounded-md font-semibold hover:bg-yellow-600 transition-all duration-200"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-800 transition-all duration-200"
            onClick={() => {
              if (window.confirm(`You Really want to Logout !`)) {
                logout();
                navigate('/')
              } else {
                alert('Glad you Stayed')
              }

            }
            }
          >
            Log Out
          </button>
        </form>
      </div>
      {/* Seller Product Listings */}
      {product.length > 0 ? (
        <div className="bg-white max-w-fit  ">
          <main className="flex-1 p-6">
            <div className="bg-white p-6 rounded-lg shadow-md">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                {product.map((post) => {

                  const getImage = (post) => {
                    if (post.images.length === 0) {
                      return "https://via.placeholder.com/300";
                    }
                    return `http://localhost:5000/${post.images[0].imageUrl}`;
                  };

                  return (
                    <div
                      key={post.id}
                      className="border rounded-lg shadow hover:shadow-lg transition p-3"
                      onClick={() => navigate(`/item-detail/${post.id}`)}
                    >
                      <img
                        src={getImage(post)}
                        alt={post.name}
                        className="w-full h-48 object-cover rounded-md" />

                      <h2 className="text-xl font-bold text-gray-800 mt-3">
                        ₹ {post.price}
                      </h2>

                      <p className="text-gray-600 font-medium">{post.name}</p>
                      <p className="text-gray-500">{post.location}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Posted on: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>) :
        <div className="ml-10 mt-20 text-gray-500 font-semibold">You have not posted any items yet.</div>
      }
    </div>
  );
};

export default Profile;
