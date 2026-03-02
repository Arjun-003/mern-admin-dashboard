import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Eye, Trash2 } from "lucide-react";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";

function UserReportsList() {
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(initialState.limit);
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    initialState.search
  );

  const { getData, deleteData } = useApi();

  const updateURL = useCallback((page, limit, search) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search && search.trim()) params.set("search", search.trim());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchReports = useCallback(
    async (page, limit, search = "") => {
      try {
        setLoading(true);
        const skip = page - 1;
        updateURL(page, limit, search);

        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          skip: skip.toString(),
          ...(search && { search: search.trim() }),
        });

        const response = await getData(
          `${ApiEndPoint.userReportsList}?${queryParams.toString()}`
        );
        if (response.body) {
          setReports(response.body.rows || []);
          setTotalRecords(response.body.count || 0);
          setTotalPages(Math.ceil((response.body.count || 0) / limit));
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setReports([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [getData, updateURL]
  );

  useEffect(() => {
    fetchReports(currentPage, entriesPerPage, debouncedSearchQuery);
  }, [currentPage, entriesPerPage, debouncedSearchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== initialState.search && currentPage !== 1)
      setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (entriesPerPage !== initialState.limit && currentPage !== 1)
      setCurrentPage(1);
  }, [entriesPerPage]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };
  const paginate = (page) => setCurrentPage(page);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleDeleteReport = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this report?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete!",
      });
      if (result.isConfirmed) {
        await deleteData(`${ApiEndPoint.userReportsDelete}/${id}`);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchReports(currentPage, entriesPerPage, debouncedSearchQuery);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.response?.data?.message || "Something went wrong!",
      });
    }
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-t-lg shadow-sm p-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">User Reports</h1>
        </div>

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
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search ..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S NO.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No reports found"
                        : "No reports available"}
                    </td>
                  </tr>
                ) : (
                  reports.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.reportedByUser?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.reportedToUser?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {item.reason || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() =>
                            navigate(`/userReports_view/${item.id}`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        {/* <button
                          onClick={() => handleDeleteReport(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button> */}
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
              {totalRecords} entries{" "}
              {searchQuery && `(filtered by "${searchQuery}")`}
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
              {[...Array(Math.min(totalPages, 10)).keys()].map((number) => {
                let pageNumber =
                  totalPages <= 10
                    ? number + 1
                    : Math.min(currentPage - 5 + number, totalPages);
                return pageNumber <= totalPages ? (
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
                ) : null;
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

export default UserReportsList;
