import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import Popup from 'reactjs-popup';
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { IoIosHeart } from "react-icons/io";
import { useAuth } from '../context/AuthProvider.jsx';


const ProductDetail = () => {

    const navigate = useNavigate()
    const { user, token, loading } = useAuth();
    const [product, setProduct] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLiked, setIsLiked] = useState(false);
    const [seller, setSeller] = useState([])
    const { id } = useParams()
    console.log(id, "this is the id from the url");
    //    For fetching the product data
    useEffect(() => {
        const getProduct = async () => {
            const response = await api.get(`/singleProduct/${id}`);
            setProduct(response.data)
            console.log(response.data);
        }
        getProduct()
    }, [id]);

    // For fetching the seller data
    useEffect(() => {
        if (!product?.sellerId) return;
        const getUser = async () => {
            const res = await api.get(`/singleUser/${product.sellerId}`);
            setSeller(res.data.singleUser);
        };
        getUser();
    }, [product?.sellerId]);


    if (!product) return <p className="text-center mt-10">Loading...</p>

    const images = product.images || []

    const nextImage = () => {
        if (images.length === 0) return
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        if (images.length === 0) return
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Product Delete Function
    const deleteItem = async () => {
        try {
            const response = await api.delete(`/deleteProduct/${product.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                alert("Product deleted successfully");
                navigate("/profile",{ replace: true });
            } else {
                alert("Failed to delete product");
            }
        }
        catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    }

    // Handle Heart Icon Click
    const handleChangeHeart = async () => {

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        try {

            if (newLikedState) {
               const res = await api.post(`/like/${product.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
               }
                );
                res.status === 200 

            } else {
                const res = await api.delete(`/unlike/${product.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                res.status === 200
            }

        } catch (error) {
            console.error(error);
            // rollback UI if API fails
            setIsLiked(!newLikedState);
        }
    }

    return (
        <>
            <div className="max-w-3xl mt-40 mx-auto ml-96 p-4">
                {/* ---- Image Slider ---- */}
                <div className="relative w-8/12 h-[450px] rounded-xl overflow-hidden border flex items-center justify-center bg-black/5">
                    {images.length > 0 ? (
                        <img
                            src={`http://localhost:5000/${images[currentIndex].imageUrl.replace(/\\/g, "/")}`}
                            className="max-w-full max-h-full object-contain transition-all duration-300"
                        />
                    ) : (
                        <p className="text-center">No Images</p>
                    )}

                    {/* Prev Button */}
                    <button
                        onClick={prevImage}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
                    >
                        <MdChevronLeft />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={nextImage}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full"
                    >
                        <MdChevronRight />
                    </button>

                </div>
                {/* Delete Product Button */}
                <div className="flex justify-between items-center mt-4">

                    {user?.id === product?.sellerId && (
                        <button
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
                            onClick={deleteItem}
                        >
                            Delete Product
                        </button>
                    )}

                    <IoIosHeart
                        className={`ml-auto size-7 cursor-pointer transition ${isLiked ? "text-red-500" : "text-neutral-500"}`}
                        onClick={handleChangeHeart}
                    />


                </div>

                {/* ---- Product Details ---- */}
                <div className="mt-6 space-y-3">
                    <h1 className="text-2xl font-bold text-gray-800">{product?.name}</h1>

                    <p className="text-lg font-semibold text-green-600">
                        ₹ {product?.price}
                    </p>

                    <p className="text-gray-700">{product?.description}</p>

                    <p className="text-gray-600">
                        <span className="font-semibold">Location:</span> {product?.location}
                    </p>

                    <p className="text-gray-600">
                        <span className="font-semibold">Condition:</span> {product?.condition}
                    </p>
                </div>

                {/* Product User Image */}
                <div className="mt-6 flex items-center gap-4">

                    {/* LEFT SIDE — Seller Info */}
                    <div className="flex items-center gap-4">
                        {seller && (
                            <>
                                <img
                                    src={
                                        seller.profile_image
                                            ? `http://localhost:5000/${seller.profile_image}`
                                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-4"
                                />
                                <p className="font-semibold">{seller.name}</p>
                            </>
                        )}
                    </div>

                    {/* RIGHT SIDE — Actions */}
                    {seller.id !== user?.id ? (
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate(`/chat-window/${seller.id}/${product.id}`)}
                                className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 transition"
                            >
                                Chat With Seller
                            </button>

                            <Popup
                                trigger={
                                    <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition">
                                        Call Now
                                    </button>
                                }
                                modal
                                nested
                            >
                                {(close) => (
                                    <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
                                        <h2 className="text-xl font-bold text-center">
                                            🤙 Contact {seller?.name}
                                        </h2>

                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-gray-500">Mobile Number</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {product?.phone}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            <a
                                                href={`tel:${product?.phone}`}
                                                className="flex-1 text-center bg-green-600 text-white py-2 rounded-md"
                                            >
                                                Call
                                            </a>

                                            <button
                                                onClick={close}
                                                className="flex-1 bg-gray-200 py-2 rounded-md"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">This is your product</p>
                    )}

                </div>


            </div>
        </>
    )
}

export default ProductDetail;
