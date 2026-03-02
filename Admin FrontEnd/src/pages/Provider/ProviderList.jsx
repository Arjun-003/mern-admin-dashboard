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
import ApiEndPoint from "../../api/Constants/ApiEndPoint";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";

function ProviderList() {
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

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [banUpdateLoading, setBanUpdateLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(initialState.limit);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    initialState.search,
  );
  const [providerFilter, setProviderFilter] = useState("active");

  // Update URL without re-render
  const updateURL = useCallback((page, limit, search) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search && search.trim()) {
      params.set("search", search.trim());
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleApprove = async (id) => {
    try {
      await putData(ApiEndPoint.approveProvider, { userId: id });
      Swal.fire("Approved", "Provider approved successfully", "success");
      fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
    } catch (err) {
      Swal.fire("Error", "Failed to approve provider", "error");
    }
  };

  const handleApprovalAction = async (id, status) => {
    try {
      await putData(ApiEndPoint.approveProvider, {
        userId: id,
        status,
      });

      Swal.fire(
        "Success",
        status === 1 ? "Provider approved" : "Provider rejected",
        "success",
      );

      fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
    } catch (err) {
      Swal.fire("Error", "Action failed", "error");
    }
  };

  // Fetch providers
  const fetchProviders = useCallback(
    async (page, limit, search = "", filter = providerFilter) => {
      try {
        setLoading(true);
        const skip = page - 1;
        updateURL(page, limit, search);

        const params = new URLSearchParams({
          limit: limit.toString(),
          skip: skip.toString(),
          filter,
          ...(search && { search: search.trim() }),
        });

        const response = await getData(
          `${ApiEndPoint.getAllProvider}?${params}`,
        );
        if (response.body) {
          setProviders(response.body.rows || []);
          setTotalRecords(response.body.count || 0);
          setTotalPages(Math.ceil((response.body.count || 0) / limit));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [getData, updateURL, providerFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchProviders(1, entriesPerPage, debouncedSearchQuery);
  }, [providerFilter]);

  useEffect(() => {
    fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
  }, [currentPage, entriesPerPage, debouncedSearchQuery]);

  // Handlers
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await putData(ApiEndPoint.userStatusChange, {
        userId: id,
        status: newStatus,
      });
      Swal.fire("Success", "Status updated", "success");
      fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Badge change handler
  const handleBadgeChange = async (providerId, badge) => {
    try {
      await putData(ApiEndPoint.providerBadgeChange, {
        userId: providerId,
        badge,
      });
      Swal.fire("Success", "Badge updated", "success");
      fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
    } catch (err) {
      Swal.fire("Error", "Failed to update badge", "error");
    }
  };

  const handleBanChange = async (id, newBan) => {
    try {
      setBanUpdateLoading(true);
      await putData(ApiEndPoint.userBanChange, {
        userId: id,
        isBan: newBan,
      });
      Swal.fire("Success", "Ban status updated", "success");
      fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
    } catch (err) {
      Swal.fire("Error", "Failed to update ban", "error");
    } finally {
      setBanUpdateLoading(false);
    }
  };

  const handleDeleteProvider = async (id, name) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${name}" permanently?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteData(`${ApiEndPoint.deleteUser}/${id}`);
        Swal.fire("Deleted!", `"${name}" has been deleted.`, "success");
        fetchProviders(currentPage, entriesPerPage, debouncedSearchQuery);
      }
    });
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

  return (
    <div className="min-h-screen">
      {statusUpdateLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-md bg-black/50"></div>
          <div className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-700">Updating Status...</p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-t-lg shadow-sm p-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Hosts</h1>
        </div>

        <div className="bg-white rounded-b-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-gray-600 mr-2">Show</span>
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="border rounded px-2 py-1 w-20"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-4">
              {["pending", "active", "inactive", "banned", "rejected"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setProviderFilter(status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      providerFilter === status
                        ? status === "pending"
                          ? "bg-orange-500 text-white"
                          : status === "rejected"
                            ? "bg-gray-700 text-white"
                            : status === "active"
                              ? "bg-green-600 text-white"
                              : status === "inactive"
                                ? "bg-yellow-500 text-white"
                                : "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ),
              )}
            </div>

            <div className="flex w-full sm:w-auto gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 pr-4 py-2 border rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "S.NO",
                    "NAME",
                    "EMAIL",
                    "PHONE",
                    "Profile",
                    "STATUS",
                    "BAN",
                    "BADGE",
                    "ACTIONS",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
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
                ) : providers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No providers found"
                        : "No providers available"}
                    </td>
                  </tr>
                ) : (
                  providers.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{startIndex + idx}</td>
                      <td className="px-6 py-4">{p.fullName}</td>
                      <td className="px-6 py-4">{p.email}</td>
                      <td className="px-6 py-4">
                        {p.countryCode}-{p.phoneNumber}
                      </td>

                      {/* Profile Picture */}
                      <td className="px-6 py-4">
                        {p.profilePicture ? (
                          <img
                            src={`${ApiEndPoint.baseUrl}${p.profilePicture}`}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Image
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {/* PENDING */}
                        {p.isApproved === 0 && (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (!value) return;

                              Swal.fire({
                                title:
                                  value === 1
                                    ? "Approve Provider?"
                                    : "Reject Provider?",
                                text:
                                  value === 1
                                    ? "Provider will be able to go live."
                                    : "Provider will be rejected.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor:
                                  value === 1 ? "#16a34a" : "#dc2626",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleApprovalAction(p.id, value);
                                }
                              });
                            }}
                            className="px-3 py-1 rounded-md bg-orange-100 text-orange-700 font-medium"
                          >
                            <option value="" disabled>
                              Pending
                            </option>
                            <option value={1}>Approve</option>
                            <option value={2}>Reject</option>
                          </select>
                        )}

                        {/* REJECTED → APPROVE AGAIN */}
                        {p.isApproved === 2 && (
                          <button
                            onClick={() => {
                              Swal.fire({
                                title: "Approve Rejected Provider?",
                                text: "This provider will be reactivated.",
                                icon: "question",
                                showCancelButton: true,
                                confirmButtonText: "Approve",
                                confirmButtonColor: "#16a34a",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleApprovalAction(p.id, 1);
                                }
                              });
                            }}
                            className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-green-200 hover:text-green-800 transition"
                          >
                            Approve?
                          </button>
                        )}

                        {/* APPROVED → ACTIVE / INACTIVE */}
                        {p.isApproved === 1 && (
                          <button
                            onClick={() =>
                              handleStatusChange(p.id, p.status === 1 ? 0 : 1)
                            }
                            disabled={statusUpdateLoading || p.isBan === 1}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                              p.isBan === 1
                                ? "bg-gray-200"
                                : p.status === 1
                                  ? "bg-green-500"
                                  : "bg-red-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                p.status === 1
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        )}
                      </td>

                      {/* Ban */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleBanChange(p.id, p.isBan === 1 ? 0 : 1)
                          }
                          disabled={banUpdateLoading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                            p.isBan === 1 ? "bg-red-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                              p.isBan === 1 ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Badge */}
                      <td className="px-6 py-4">
                        <select
                          value={p.profileBadge || 0}
                          onChange={(e) =>
                            handleBadgeChange(p.id, parseInt(e.target.value))
                          }
                          className={`px-2 py-1 rounded text-white font-medium cursor-pointer appearance-none
                            ${
                              p.profileBadge === 0
                                ? "bg-gray-500"
                                : p.profileBadge === 1
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                            }`}
                        >
                          <option value={0} className="bg-gray-500 text-white">
                            Normal
                          </option>
                          <option value={1} className="bg-blue-500 text-white">
                            Verified
                          </option>
                          <option
                            value={2}
                            className="bg-yellow-500 text-white"
                          >
                            Featured
                          </option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/providers_view/${p.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(p.id, p.fullName)}
                          className="text-red-600 hover:text-red-800"
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
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(Math.min(totalPages, 10)).keys()].map((i) => {
                const pageNumber =
                  totalPages <= 10 ? i + 1 : Math.max(1, currentPage - 5) + i;
                if (pageNumber > totalPages) return null;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md ${
                      currentPage === pageNumber
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
                className={`flex items-center justify-center w-8 h-8 rounded-md ${
                  currentPage === totalPages || totalPages === 0
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

export default ProviderList;
