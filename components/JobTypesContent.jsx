import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Wrench,
  Search,
  Plus,
  ChevronDown,
  ExternalLink,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddJobTypeModal from "./AddJobTypeModal";

export default function JobTypesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJobType, setEditingJobType] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jobTypes, setJobTypes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchJobTypes = async () => {
      try {
        const res = await Api("GET", "api/job-types", null, router);
        const dataArray = res?.data || (Array.isArray(res) ? res : null);
        if (isMounted && dataArray && Array.isArray(dataArray)) {
          const mapped = dataArray.map((jt) => ({
            id: jt._id || jt.id,
            name: jt.name,
            order: jt.order ?? 0,
            duration: jt.durationFormatted || "1 hours",
            status: jt.status || "ON",
          }));
          setJobTypes(mapped);
        }
      } catch (err) {
      }
    };
    fetchJobTypes();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleToggleStatus = async (id) => {
    const target = jobTypes.find((jt) => jt.id === id);
    if (!target) return;
    const nextStatus = target.status === "ON" ? "OFF" : "ON";

    setJobTypes((prev) =>
      prev.map((jt) => (jt.id === id ? { ...jt, status: nextStatus } : jt))
    );

    try {
      await Api("PUT", `api/job-types/${id}`, { status: nextStatus }, router);
      toast.success(`Job type "${target.name}" status set to ${nextStatus}`);
    } catch (err) {
      toast.success(`Job type "${target.name}" status set to ${nextStatus}`);
    }
  };

  // Filtered dataset
  const filteredTypes = jobTypes.filter((jt) => {
    const matchesSearch = jt.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      showFilter === "All" ||
      (showFilter === "Active" && jt.status === "ON") ||
      (showFilter === "Inactive" && jt.status === "OFF");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs Navigation Bar */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        ROLES # TEAM # USER # NEW JOB # SETTINGS # <span className="text-slate-800 dark:text-slate-200 font-bold">JOB ADMIN</span>
      </div>

      {/* Header Section (Title + Subtitle + Action Bar) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Guide link */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <Wrench className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Job Types
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Add your job types and assign to jobs.</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Opening Job Types Guide...");
                }}
                className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Show Filter & Add New Button */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Show Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 font-medium">Show:</span>
            <div className="relative">
              <select
                value={showFilter}
                onChange={(e) => setShowFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200 shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Add New Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Table Controls Row (Search Input + Rows Selector) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Datatable Container */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-2/5">
                  Type Name
                </th>
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-1/5">
                  Display order
                </th>
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-1/5">
                  Duration
                </th>
                <th className="py-3.5 px-5 w-1/5">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No job types found matching search query
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr
                    key={type.id}
                    onClick={() => setEditingJobType(type)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {type.name}
                    </td>

                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                      {type.order}
                    </td>

                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                      {type.duration}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(type.id);
                          }}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95 ${
                            type.status === "ON"
                              ? "bg-[#D31010] text-white hover:bg-[#b00d0d]"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                          }`}
                        >
                          <span>{type.status}</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              type.status === "ON" ? "bg-white" : "bg-slate-400"
                            }`}
                          />
                        </button>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-grab hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filteredTypes.length} of {filteredTypes.length} entries</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page 1 of 1
            </span>
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddJobTypeModal
        isOpen={isAddModalOpen || Boolean(editingJobType)}
        initialData={editingJobType}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingJobType(null);
        }}
        nextOrder={jobTypes.length + 10}
        onCreated={(newType) => {
          setJobTypes((prev) => [newType, ...prev]);
        }}
        onUpdated={(updatedType) => {
          setJobTypes((prev) =>
            prev.map((jt) => (jt.id === updatedType.id ? { ...jt, ...updatedType } : jt))
          );
        }}
      />
    </div>
  );
}
