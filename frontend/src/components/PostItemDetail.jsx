import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

const PostItemDetail = () => {
    const navigate = useNavigate()
    const [images, setImages] = useState([]); // Preview URLs
    const [imageFiles, setImageFiles] = useState([]); // Original Files (for upload)

    const { user, token } = useAuth();

    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        location: "",
        condition: "",
    });

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleRemoveImage = (index) => {
        setImages((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });

        setImageFiles((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const categoryId = localStorage.getItem("categoryId");
            const subCategoryId = localStorage.getItem("subCategoryId");

            const fd = new FormData();

            fd.append("name", product.name);
            fd.append("description", product.description);
            fd.append("price", product.price);
            fd.append("location", product.location);
            fd.append("condition", product.condition);
            fd.append("categoryId", categoryId);
            fd.append("SubCategoryId", subCategoryId);

            // --- Upload Image Files ---
            imageFiles.forEach((file) => {
                fd.append("imageUrl", file);
            });
            console.log(fd, "Here is the Fd data hey ");
            const response = await api.post("/createProduct", fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Product Posted")
            navigate("/")
            console.log("Product posted:", response.data);
        } catch (error) {
            console.error("Error posting product:", error);
        }
    };

    return (
        <>

            <section className="flex justify-center items-start bg-gray-100 min-h-screen py-10">
                <form
                    className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">
                        Sell Your Item
                    </h2>

                    {/* Hidden file input */}
                    <input
                        id="multi-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files);

                            setImageFiles((prevFiles) => {
                                const combinedFiles = [...prevFiles, ...selectedFiles].slice(0, 10);
                                return combinedFiles;
                            });

                            setImages((prevImages) => {
                                const newUrls = selectedFiles.map((file) =>
                                    URL.createObjectURL(file)
                                );
                                const combinedImages = [...prevImages, ...newUrls].slice(0, 10);
                                return combinedImages;
                            });

                            e.target.value = null; // IMPORTANT: allows re-selecting same image
                        }}

                    />

                    {/* Image Preview Boxes */}
                    <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <label
                                key={index}
                                htmlFor="multi-upload"
                                className="w-20 h-20 border-2 border-dashed border-gray-300 
            rounded-lg flex items-center justify-center cursor-pointer"
                            >
                                {images[index] ? (
                                    <div className="relative group w-full h-full">
                                        <img
                                            src={images[index]}
                                            className="w-full h-full object-cover rounded-lg"
                                        />

                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemoveImage(index);
                                            }}
                                            className="absolute top-1 right-1 bg-black/70 text-white 
                 rounded-full w-5 h-5 text-xs flex items-center 
                 justify-center opacity-0 group-hover:opacity-100
                 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-2xl text-gray-400">+</span>
                                )}

                            </label>
                        ))}
                    </div>


                    {/* Condition */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Item Condition
                        </label>
                        <select
                            name="condition"
                            value={product.condition}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                        >
                            <option value="">Item Condition</option>
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Used">Used</option>
                            <option value="Very Used">Very Used</option>
                        </select>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Item Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            placeholder="Enter item name"
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            className="w-full border border-gray-300 rounded-md p-2"
                        ></textarea>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={product.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block mb-1 text-gray-700 font-medium">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            placeholder="Set Price"
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                        >
                            Post Product
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
};

export default PostItemDetail;
