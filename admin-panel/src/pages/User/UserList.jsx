import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  Eye,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";

function UserList() {
  // Initialize state from URL parameters
  const getInitialStateFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      page: Math.max(1, parseInt(params.get("page")) || 1), // Ensure minimum page is 1
      limit: parseInt(params.get("limit")) || 10,
      search: params.get("search") || "",
    };
  };
  // State management
  const initialState = getInitialStateFromURL();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(initialState.limit);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    initialState.search
  );
  const [userFilter, setUserFilter] = useState("active");

  // Get API hook
  const { getData, deleteData, putData } = useApi();
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users data with server-side pagination and search
  const fetchUsers = useCallback(
    async (page, limit, search = "") => {
      try {
        setLoading(true);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search: search.trim() }),
          ...(userFilter && { status: userFilter }),
        });

        const response = await getData(
          `${ApiEndPoint.getAllUser}?${queryParams.toString()}`
        );
        console.log(response.data,"user data ");
        if (response.success) {
          setUsers(response.data || []);
          setTotalRecords(response.pagination.totalRecords || 0);
          setTotalPages(response.pagination.totalPages || 1);
        }
        console.log(response, 'respones');
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [getData, userFilter]
  );


  useEffect(() => {
    fetchUsers(currentPage, entriesPerPage, debouncedSearchQuery);
  }, [currentPage, entriesPerPage, debouncedSearchQuery, userFilter]);




  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  // Handle page changes
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  const handleStatusChange = async (userId, newStatus) => {
    console.log(userId, newStatus,'userID and name');
    try {
      
      setStatusUpdateLoading(true);

      const data = {
        userId,
        status: newStatus,
      };

      const response = await putData(
        ApiEndPoint.userStatusChange,
        data,
        false
      );

      if (response.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, status: newStatus }
              : user
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

  // Handle entries per page change
  const handleEntriesChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setEntriesPerPage(newLimit);
    setCurrentPage(1); // Reset to first page
  };

  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to delete "${userName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete!",
    });

    if (!result.isConfirmed) return;

    try {
      // Optional: show loading state inside SweetAlert
      Swal.fire({
        title: "Deleting...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await deleteData(`${ApiEndPoint.deleteUser}/${userId}`);

      // Close loading popup
      Swal.close();

      // Show success AFTER API success
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `"${userName}" has been deleted successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh list
      fetchUsers(currentPage, entriesPerPage, debouncedSearchQuery);

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.response?.data?.message || "Something went wrong!",
      });
    }
  };
  // Calculate display indices
  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

  return (
    <div className="min-h-screen">
      {/* Enhanced Full Screen Loader with Pure Blur Background */}
      {statusUpdateLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Pure Blurred Background */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              backdropFilter: "blur(2px)",
              background: "rgba(0, 0, 0, 0.5)",
            }}
          ></div>

          {/* Crystal Clear Loader */}
          <div className="relative z-10 bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white border-opacity-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-200 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Updating Status
                </h3>
                <p className="text-sm text-gray-600">
                  Please wait while we process your request...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="bg-white rounded-t-lg shadow-sm p-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Members</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-gray-600 mr-2">Show</span>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setUserFilter("active");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${userFilter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Active Users
              </button>

            </div>


            <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S&nbsp;NO.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PHONE&nbsp;NO.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROFILE&nbsp;PIC.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No users found matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.mobile_Number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.profile_image ? (
                          <img
                            src={`${ApiEndPoint.IMAGE_BASE_URL}/${user.profile_image}`}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <img
                            src={`https://cdn-icons-png.flaticon.com/512/149/149071.png`}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                      </td>

                      {/* User Actice Inactive status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              user.id,
                              user.status === "active" ? "inactive" : "active"
                            )
                          }
                          disabled={statusUpdateLoading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${user.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${user.status === "active"
                              ? "translate-x-6"
                              : "translate-x-1"
                              }`}
                          />
                        </button>
                      </td>



                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {/* View Button */}
                        <button
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="view"
                          onClick={() => navigate(`/users_view/${user.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Edit Button */}
                        {/* <button
                          onClick={() => navigate(`/users_edit/${user.id}`)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button> */}

                        {/* Delete Button */}
                        <button
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content="delete  "
                          onClick={() =>
                            handleDeleteUser(user.id, user.name)
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
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
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Showing {totalRecords > 0 ? startIndex : 0} to {endIndex} of{" "}
              {totalRecords} entries
              {searchQuery && ` (filtered by "${searchQuery}")`}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              {totalPages > 0 &&
                [...Array(Math.min(totalPages, 10)).keys()].map((number) => {
                  let pageNumber;
                  if (totalPages <= 10) {
                    pageNumber = number + 1;
                  } else {
                    // Show pages around current page for large datasets
                    const startPage = Math.max(1, currentPage - 5);
                    pageNumber = startPage + number;
                    if (pageNumber > totalPages) return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`flex items-center justify-center w-8 h-8 rounded-md ${currentPage === pageNumber
                        ? "bg-[#529fb7] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${currentPage === totalPages || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Tooltip id="my-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
}

export default UserList;
