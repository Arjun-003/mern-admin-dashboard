import { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { RiMessageLine } from "react-icons/ri";
import { CatContext } from "../context/CategoriesContext.jsx";
import socket from "../api/SocketIo.js";

const Header = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { user, logout } = useContext(AuthContext);
    const { categories = [], subCategories = [] } = useContext(CatContext);
    const [imagepreview, setImagePreview] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({ search: "" });

    /* ---------------- Avatar Image Reset ---------------- */
    useEffect(() => {
        setImageError(false);
    }, [user?.profile_image]);

    useEffect(() => {
        if (user?.profile_image) {
            setImagePreview(`http://localhost:5000/${user.profile_image}`);
            console.log(user.profile_image);
        } else {
            setImagePreview(null);
        }
    }, [user?.profile_image]);

    /* ---------------- Search Handler ---------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.search.trim()) return;

        const newParams = new URLSearchParams(searchParams);
        newParams.set("search", formData.search);
        setSearchParams(newParams);
    };

    /* ---------------- Socket Setup ---------------- */
    useEffect(() => {
        if (!user?.id) return;

        socket.connect();
        socket.emit("join", user.id);

        const handleUnread = (count) => {
            setUnreadCount(count);
        };

        socket.on("unreadCountUpdate", handleUnread);

        return () => {
            socket.off("unreadCountUpdate", handleUnread);
            socket.disconnect();
        };
    }, [user?.id]);

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 bg-[#111D13] flex items-center justify-evenly h-24 shadow-md">

                {/* Logo */}
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-28 cursor-pointer"
                    onClick={() => navigate("/")}
                />

                {/* Location Dropdown */}
                <select className="p-2 w-48 rounded-md border bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-yellow-500">
                    <option value="">Choose Location</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Mohali">Mohali</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Rajasthan">Rajasthan</option>
                </select>

                {/* Search */}
                <div className="flex items-center">
                    <input
                        type="text"
                        name="search"
                        value={formData.search}
                        onChange={handleChange}
                        placeholder="Search items here..."
                        className="rounded-md w-80 h-10 px-4 shadow-sm focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                        onClick={handleSubmit}
                        className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                    >
                        Search
                    </button>
                </div>

                {/* User Section */}
                {!user ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                    >
                        Login
                    </button>
                ) : (
                    <div className="relative group">

                        {/* Avatar */}
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 cursor-pointer">

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 flex items-center justify-center bg-yellow-500 text-white font-semibold">
                                {imagepreview && !imageError ? (
                                    <img
                                        src={imagepreview}
                                        alt={user?.name || "User"}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <span>
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            {/* Username */}
                            <span className="text-white font-medium">
                                {user?.name || "User"}
                            </span>

                        </div>
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-0 w-40 bg-white text-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                            <ul className="py-2">
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => navigate("/profile")}
                                >
                                    Profile
                                </li>
                                <li
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-800 cursor-pointer"
                                    onClick={() => {
                                        if (window.confirm("Are you sure?")) {
                                            logout();
                                        }
                                    }}
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Chat Button */}
                {user && (
                    <button
                        onClick={() => navigate("/chat-box")}
                        className="relative text-yellow-500 p-2 hover:bg-amber-50 rounded-md transition"
                    >
                        <RiMessageLine className="text-2xl" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                )}

                {/* Sell Button */}
                <button
                    onClick={() => {
                        if (!user) {
                            alert("Please login to sell item");
                            navigate("/login");
                            return;
                        }
                        navigate("/post-categories");
                    }}
                    className="px-5 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                >
                    Sell Item
                </button>
            </header>

            {/* Categories */}
            <section className="fixed top-24 left-0 w-full z-40 bg-[#30362F] text-white h-10 flex items-center justify-center shadow-sm">
                <ul className="flex gap-10">

                    {categories.map((cat) => (
                        <li key={cat.id} className="relative group px-3 py-2 cursor-pointer">
                            <p className="font-semibold group-hover:text-yellow-400 transition">
                                {cat.title}
                            </p>

                            <div className="absolute left-0 bg-white text-black rounded-lg shadow-lg w-40 p-3 hidden group-hover:block">
                                {subCategories
                                    .filter((sub) => sub.categoryId === cat.id)
                                    .map((sub) => (
                                        <p
                                            key={sub.id}
                                            className="px-2 py-1 hover:bg-yellow-400 rounded-md cursor-pointer"
                                            onClick={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.set("subCategoryId", sub.id);
                                                setSearchParams(newParams);
                                            }}
                                        >
                                            {sub.title}
                                        </p>
                                    ))}
                            </div>
                        </li>
                    ))}

                </ul>
            </section>
        </>
    );
};

export default Header;