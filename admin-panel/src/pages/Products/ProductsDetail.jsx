import React, { useState, useEffect, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Eye,
    Trash2,
    Loader2,
} from "lucide-react";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";

function ProductsDetail() {
    const getInitialStateFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            page: Math.max(1, parseInt(params.get("page")) || 1),
            limit: parseInt(params.get("limit")) || 10,
            search: params.get("search") || "",
        };
    };

    const initialState = getInitialStateFromURL();
    const navigate = useNavigate();
    const { getData, putData, deleteData } = useApi();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

    const [entriesPerPage, setEntriesPerPage] = useState(initialState.limit);
    const [currentPage, setCurrentPage] = useState(initialState.page);
    const [searchQuery, setSearchQuery] = useState(initialState.search);

    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [debouncedSearchQuery, setDebouncedSearchQuery] =
        useState(initialState.search);

    const [productFilter, setProductFilter] = useState("active");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch products
    const fetchProducts = useCallback(
        async (page, limit, search = "") => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    ...(search && { search: search.trim() }),
                    ...(productFilter && { status: productFilter }),
                    
                });

                const response = await getData(
                    `${ApiEndPoint.getAllProducts}?${params.toString()}`
                );
                console.log(response.data, "all Products response");


                if (response.success) {
                    setProducts(response.data || []);
                    setTotalRecords(response.pagination.totalRecords || 0);
                    setTotalPages(response.pagination.totalPages || 1);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        },
        [getData, productFilter]
    );

    useEffect(() => {
        fetchProducts(currentPage, entriesPerPage, debouncedSearchQuery);
    }, [currentPage, entriesPerPage, debouncedSearchQuery, productFilter]);

    // Handlers
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEntriesChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setEntriesPerPage(newLimit);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleStatusChange = async (sellerId, newStatus) => {
        console.log(sellerId, newStatus, 'sellerID and name');
        try {

            setStatusUpdateLoading(true);

            const data = {
                userId: sellerId,
                status: newStatus,
            };

            const response = await putData(
                ApiEndPoint.userStatusChange,
                data,
                false
            );

            console.log(response.data.success, 'status change response');
            if (response.data.success) {
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.id === sellerId
                            ? { ...product, status: newStatus }
                            : product
                    )
                );

                Swal.fire("Success", "Status updated successfully", "success");
            } else {
                Swal.fire("Error", "Failed to update status", "error");
            }
        } catch (error) {
            console.error("Status update error:", error);
            Swal.fire("Error", "Something went wrong!", "error");
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    const handleDeleteProduct = async (id, name) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Delete "${name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes Delete",
        });

        if (!result.isConfirmed) return;

        await deleteData(`${ApiEndPoint.deleteProduct}/${id}`);

        Swal.fire("Deleted!", `"${name}" removed.`, "success");

        fetchProducts(currentPage, entriesPerPage, debouncedSearchQuery);
    };
    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

    return (
        <div className="min-h-screen">
            {statusUpdateLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 backdrop-blur-md bg-black/50"></div>
                    <div className="relative z-10 bg-white p-8 rounded-xl shadow-xl">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                </div>
            )}

            <div className="p-6">

                {/* Header */}
                <div className="bg-white p-6 rounded-t-lg shadow-sm">
                    <h1 className="text-xl font-semibold text-gray-800">Products</h1>
                </div>

                <div className="bg-white p-6 rounded-b-lg shadow-sm">

                    {/* Toolbar */}
                    <div className="flex justify-between mb-6">

                        <div className="flex items-center">
                            <span className="mr-2 text-gray-600">Show</span>
                            <select
                                value={entriesPerPage}
                                onChange={handleEntriesChange}
                                className="border px-2 py-1 rounded w-20"
                            >
                                {[10, 25, 50, 100].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-8 pr-4 py-2 border rounded w-64"
                            />
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={productFilter}
                            onChange={(e) => {
                                setProductFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border px-3 py-2 rounded ml-4"
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">

                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">S.NO</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">IMAGE</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">NAME</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">PRICE</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">CATEGORY</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">CONDITION</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">SELLER</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">LOCATION</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">DATE</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">STATUS</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 text-center">ACTIONS</th>
                                </tr>
                            </thead>    

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-6">Loading...</td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-6">No Products Found</td>
                                    </tr>
                                ) : (
                                    products.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-gray-50">

                                            <td className="px-6 py-4">{startIndex + idx}</td>

                                            <td className="px-6 py-4">
                                                {p.images && p.images.length > 0 ? (
                                                    <img
                                                    src={
                                                        p.images?.[0]?.imageUrl
                                                            ? `${ApiEndPoint.IMAGE_BASE_URL}${p.images[0].imageUrl}`
                                                            : "/no-image.png"
                                                    }
                                                    className="h-12 w-12 object-cover rounded"
                                                /> ):(
                                                    <p className="text-sm text-gray-500">No Image</p>
                                                )
                                            
                                                }
                                                
                                            </td>

                                            <td className="px-6 py-4">{p.name}</td>

                                            <td className="px-6 py-4">₹ {p.price}</td>

                                            <td className="px-6 py-4">{p.productCategory?.title}</td>

                                            <td className="px-6 py-4">{p.condition}</td>

                                            <td className="px-6 py-4">{p.productUser?.name}</td>

                                            <td className="px-6 py-4">{p.location}</td>

                                            <td className="px-6 py-4">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </td>


                                            <td className="text-center space-x-3">

                                                <button
                                                    onClick={() => navigate(`/product_view/${p.id}`)}
                                                    className="text-blue-600"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>
                    </div>

                    {/* Pagination */}

                    <div className="flex justify-between mt-6">

                        <div className="text-sm text-gray-500">
                            Showing {totalRecords > 0 ? startIndex : 0} to {endIndex} of {totalRecords}
                        </div>

                        <div className="flex space-x-2">

                            <button onClick={prevPage}>
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(totalPages).keys()].slice(0, 10).map(n => {
                                const page = n + 1
                                return (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        className={`w-8 h-8 rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            })}

                            <button onClick={nextPage}>
                                <ChevronRight size={16} />
                            </button>

                        </div>

                    </div>

                </div>
            </div>

            <Tooltip id="my-tooltip" place="top" />
        </div>
    );
}

export default ProductsDetail;