import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Tag,
  Search,
  Plus,
  ChevronDown,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddSubStatusModal from "./AddSubStatusModal";

export default function SubStatusContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [subStatuses, setSubStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await Api("GET", "api/sub-statuses", null, router);
      const dataArray = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(dataArray)) {
        setSubStatuses(dataArray);
      }
    } catch (err) {
      console.error("Fetch sub-statuses error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubStatuses();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete sub-status "${name}"?`)) return;
    try {
      const res = await Api("DELETE", `api/sub-statuses/${id}`, null, router);
      if (res && (res.success || res.message)) {
        toast.success(`Sub-status "${name}" deleted`);
        setSubStatuses((prev) => prev.filter((s) => (s._id || s.id) !== id));
      } else {
        toast.error("Failed to delete sub-status");
      }
    } catch (err) {
      toast.error("Error deleting sub-status");
    }
  };

  const filteredList = subStatuses.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(term) ||
      (item.parent_status || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs Navigation Bar (Screenshot 3 Match) */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
        NEW JOB # DASHBOARD # JOB (426) # SCHEDULE # SETTINGS # <span className="text-slate-700 dark:text-slate-300 font-bold">JOB SUB STATUS</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Guide link */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <Tag className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sub Status
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              <span>Manage different stages of your work flow and filter you schedule with sub statuses.</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Sub status documentation");
                }}
                className="text-[#4B9EFF] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: + Add New Button (Brand Red theme) */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1E31] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sub Status Table */}
      <div className="bg-white dark:bg-[#0E1E31] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-5">Sub Name</th>
                <th className="py-3.5 px-5">Sub Parent</th>
                <th className="py-3.5 px-5">Color</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D31010] mb-2" />
                    <span>Loading sub-statuses...</span>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No sub-statuses found. Click "+ Add New" to create one.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors group font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                        {item.parent_status}
                      </td>
                      <td className="py-4 px-5">
                        <div
                          className="w-14 h-4 rounded-md shadow-2xs"
                          style={{ backgroundColor: item.color || "#0052cc" }}
                        />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(id, item.name)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination (Screenshot 3 Match) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <div>
            Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Sub Status Modal */}
      <AddSubStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(newSub) => {
          setSubStatuses((prev) => [...prev, newSub]);
        }}
      />
    </div>
  );
}
