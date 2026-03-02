import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Tooltip } from "react-tooltip";


function FaqList() {
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
  const [faqs, setFaqs] = useState([]);
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
    if (search?.trim()) params.set("search", search.trim());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch FAQs
  const fetchFaqs = useCallback(
    async (page, limit, search = "") => {
      try {
        setLoading(true);
        updateURL(page, limit, search);

        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(), // send actual page number
          ...(search && { search: search.trim() }),
        });


        const response = await getData(
          `${ApiEndPoint.faqList}?${queryParams.toString()}`
        );
        if (response?.data) {
          setFaqs(response.data);
          setTotalRecords(response.totalCount || 0);
          setTotalPages(Math.ceil((response.totalCount || 0) / limit));
        } else {
          setFaqs([]);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setFaqs([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [getData, updateURL]
  );

  useEffect(() => {
    fetchFaqs(currentPage, entriesPerPage, debouncedSearchQuery);
  }, [currentPage, entriesPerPage, debouncedSearchQuery]);

  const handleDeleteFaq = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the FAQ permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await deleteData(`${ApiEndPoint.deleteFaq}/${id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            timer: 1500,
            showConfirmButton: false,
          });
          fetchFaqs(currentPage, entriesPerPage, debouncedSearchQuery);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error?.response?.data?.message || "Something went wrong!",
          });
        }
      }
    });
  };

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

  // truncate long answer to 1 line
  const truncateAnswer = (text) => {
    if (!text) return "—";
    const firstLine = text.split("\n")[0];
    return firstLine.length > 100 ? firstLine.slice(0, 100) + "..." : firstLine;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-gray-600 mr-2">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => navigate("/faq_add")}
              className="text-white px-4 py-2 rounded-md flex items-center bg-slate-900 hover:opacity-90"
            >
              <Plus size={18} className="mr-1" /> Add FAQ
            </button>
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
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer
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
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No FAQs found
                  </td>
                </tr>
              ) : (
                faqs.map((faq, index) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {startIndex + index}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {faq.question || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {truncateAnswer(faq.answer)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-3">
                      <button
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="view"
                        onClick={() => navigate(`/faq_view/${faq.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="edit"
                        onClick={() => navigate(`/faq_edit/${faq.id}`)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="delete"
                        onClick={() => handleDeleteFaq(faq.id)}
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
            Showing {totalRecords ? startIndex : 0} to {endIndex} of{" "}
            {totalRecords} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(Math.min(totalPages, 10)).keys()].map((i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === page
                      ? "bg-[#529fb7] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <Tooltip id="my-tooltip" place="top" type="dark" effect="solid" />
    </div>
  );
}

export default FaqList;
