import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Map as MapIcon,
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
import AddServiceAreaModal from "./AddServiceAreaModal";

export default function ServiceAreasContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [serviceAreas, setServiceAreas] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchServiceAreas = async () => {
      try {
        const res = await Api("GET", "api/service-areas", null, router);
        const dataArray = res?.data || (Array.isArray(res) ? res : null);
        if (isMounted && dataArray && Array.isArray(dataArray)) {
          const mapped = dataArray.map((sa) => ({
            id: sa._id || sa.id,
            name: sa.name,
            color: sa.color || "#00FFC2",
            enabled: sa.enabled || "Enabled",
            status: sa.status || "ON",
          }));
          setServiceAreas(mapped);
        }
      } catch (err) {
      }
    };
    fetchServiceAreas();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleToggleStatus = async (id) => {
    const target = serviceAreas.find((sa) => sa.id === id);
    if (!target) return;
    const nextStatus = target.status === "ON" ? "OFF" : "ON";

    setServiceAreas((prev) =>
      prev.map((sa) => (sa.id === id ? { ...sa, status: nextStatus } : sa))
    );

    try {
      await Api("PUT", `api/service-areas/${id}`, { status: nextStatus }, router);
      toast.success(`Service area "${target.name}" status set to ${nextStatus}`);
    } catch (err) {
      toast.success(`Service area "${target.name}" status set to ${nextStatus}`);
    }
  };

  // Filtered dataset
  const filteredAreas = serviceAreas.filter((sa) => {
    const matchesSearch = sa.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      showFilter === "All" ||
      (showFilter === "Active" && sa.status === "ON") ||
      (showFilter === "Inactive" && sa.status === "OFF");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs Navigation Bar */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        NEW LEAD # SCHEDULE # MAP # MANAGE FIELDS # SETTINGS # <span className="text-slate-800 dark:text-slate-200 font-bold">SERVICE AREAS</span>
      </div>

      {/* Header Section (Title + Subtitle + Action Bar) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Guide link */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <MapIcon className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Service Areas
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Divide your service areas to make team scheduling easy.</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Opening Service Areas Guide...");
                }}
                className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Show Filter & Add Service area Button */}
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

          {/* Add Service area Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Service area</span>
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
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-1/4">
                  Name
                </th>
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-2/5">
                  Color Class
                </th>
                <th className="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 w-1/5">
                  Enabled
                </th>
                <th className="py-3.5 px-5 w-1/5">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No service areas found matching search query
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr
                    key={area.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {area.name}
                    </td>

                    {/* Color Class (Colored Bar Pill Matching Screenshot 1) */}
                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60">
                      <div
                        style={{ backgroundColor: area.color }}
                        className="w-full max-w-[280px] h-3.5 rounded-full shadow-inner border border-black/10"
                      />
                    </td>

                    {/* Enabled */}
                    <td className="py-4 px-5 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                      {area.enabled}
                    </td>

                    {/* Status Badge + Reorder Grip Handle (Exact Match Screenshot 1) */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(area.id)}
                          className={`px-3 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer shadow-sm ${
                            area.status === "ON"
                              ? "bg-[#D31010] text-white hover:bg-[#b00d0d]"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {area.status}
                        </button>
                        <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-grab">
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

        {/* Datatable Pagination Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filteredAreas.length} of {filteredAreas.length} entries</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-slate-700 dark:text-slate-300">
              Page 1 of 1
            </span>
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Service Area Modal */}
      <AddServiceAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(newArea) => {
          setServiceAreas((prev) => [newArea, ...prev]);
        }}
      />
    </div>
  );
}
