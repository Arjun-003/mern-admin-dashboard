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

function SellerList() {
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

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  const [entriesPerPage, setEntriesPerPage] = useState(initialState.limit);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [searchQuery, setSearchQuery] = useState(initialState.search);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(initialState.search);

  const [sellerFilter, setSellerFilter] = useState("active");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Sellers
  const fetchSellers = useCallback(
    async (page, limit, search = "") => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search: search.trim() }),
          ...(sellerFilter && { status: sellerFilter }),
        });

        const response = await getData(
          `${ApiEndPoint.getAllSellers}?${params.toString()}`
        );
        console.log(response.data,"allSeller");
        
        
        if (response.success) {
          setSellers(response.data || []);
          setTotalRecords(response.pagination.totalRecords || 0);
          setTotalPages(response.pagination.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    },
    [getData, sellerFilter]
  );

  useEffect(() => {
    fetchSellers(currentPage, entriesPerPage, debouncedSearchQuery);
  }, [currentPage, entriesPerPage, debouncedSearchQuery, sellerFilter]);

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
      console.log(sellerId, newStatus,'sellerID and name');
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

        console.log(response.data.success,'status change response');
        if (response.data.success) {
          setSellers((prevSellers) =>
            prevSellers.map((seller) =>
              seller.id === sellerId
                ? { ...seller, status: newStatus }
                : seller
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

  const handleDeleteSeller = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes Delete",
    });

    if (!result.isConfirmed) return;

    await deleteData(`${ApiEndPoint.deleteUser}/${id}`);

    Swal.fire("Deleted!", `"${name}" removed.`, "success");

    fetchSellers(currentPage, entriesPerPage, debouncedSearchQuery);
  };
  const getInitials = (name = "") => {
    return name.split(" ").join("").substring(0, 2).toUpperCase();
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
          <h1 className="text-xl font-semibold text-gray-800">Sellers</h1>
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
                {[10,25,50,100].map(n=>(
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 pr-4 py-2 border rounded w-64"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500">S.NO</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500">NAME</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500">EMAIL</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500">PHONE</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500">PROFILE</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 text-center">STATUS</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 text-center">ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6">Loading...</td>
                  </tr>
                ) : sellers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6">No Sellers Found</td>
                  </tr>
                ) : (
                  sellers.map((p,idx)=>(
                    <tr key={p.id} className="hover:bg-gray-50">

                      <td className="px-6 py-4">{startIndex+idx}</td>
                      <td className="px-6 py-4">{p.name}</td>
                      <td className="px-6 py-4">{p.email}</td>
                      <td className="px-6 py-4">{p.mobile_Number}</td>

                      <td className="px-6 py-4 ">
                        {p.profile_image ? (
                          <img
                            src={`${ApiEndPoint.IMAGE_BASE_URL}${p.profile_image}`}
                            alt="User"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {getInitials(p?.name || "NA")}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() =>
                              handleStatusChange(
                                p.id,
                                p.status === "active" ? "inactive" : "active"
                              )
                            }
                            disabled={statusUpdateLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${p.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${p.status === "active"
                                ? "translate-x-6"
                                : "translate-x-1"
                                }`}
                            />
                          </button>
                        </td>
                      {/* ACTIONS */}
                      <td className="text-center space-x-3">

                        <button
                          onClick={()=>navigate(`/sellers_view/${p.id}`)}
                          className="text-blue-600"
                        >
                          <Eye size={18}/>
                        </button>

                        <button
                          onClick={()=>handleDeleteSeller(p.id,p.name)}
                          className="text-red-600"
                        >
                          <Trash2 size={18}/>
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
              Showing {totalRecords>0?startIndex:0} to {endIndex} of {totalRecords}
            </div>

            <div className="flex space-x-2">

              <button onClick={prevPage}>
                <ChevronLeft size={16}/>
              </button>

              {[...Array(totalPages).keys()].slice(0,10).map(n=>{
                const page=n+1
                return(
                  <button
                    key={page}
                    onClick={()=>paginate(page)}
                    className={`w-8 h-8 rounded ${
                      currentPage===page?"bg-blue-500 text-white":"bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button onClick={nextPage}>
                <ChevronRight size={16}/>
              </button>

            </div>

          </div>

        </div>
      </div>

      <Tooltip id="my-tooltip" place="top"/>
    </div>
  );
}

export default SellerList;