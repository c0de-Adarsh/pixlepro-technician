import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Calendar,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Tag,
  Clock,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";

// Sample initial leads matching the exact design reference image
const initialLeads = [
  {
    id: 48,
    status: "new",
    tags: [],
    source: "Facebook",
    client: {
      name: "Chong Cc",
      email: "jesusmansion@gmail.com",
    },
    location: "",
    type: "Camera Installation",
    phone: "(604) 518-1614",
    created: "Mon Sep 08, 2025 10:03 pm",
    modified: "Mon Sep 08, 2025 10:03 pm",
  },
  {
    id: 46,
    status: "in progress",
    tags: ["SERVICE CAL"],
    source: "Facebook",
    client: {
      name: "David",
      email: "djpro@shaw.ca",
    },
    location: "487 Ev...",
    type: "Service Call",
    phone: "(408) 803-4481",
    created: "Sat Sep 06, 2025 10:13 pm",
    modified: "Mon Sep 08, 2025 10:13 pm",
  },
  {
    id: 45,
    status: "new",
    tags: [],
    source: "Google Ads",
    client: {
      name: "Bruce Fos",
      email: "jb.foster@shaw.ca",
    },
    location: "850 11 ...",
    type: "Tv Installation",
    phone: "(403) 837-2022",
    created: "Thu May 22, 2025 02:59 pm",
    modified: "Thu May 22, 2025 02:59 pm",
  },
  {
    id: 44,
    status: "estimated",
    tags: ["VIP"],
    source: "Website",
    client: {
      name: "Sarah Jenkins",
      email: "s.jenkins@outlook.com",
    },
    location: "1024 Broadway St",
    type: "Security System",
    phone: "(604) 772-9104",
    created: "Wed May 21, 2025 11:20 am",
    modified: "Thu May 22, 2025 09:15 am",
  },
  {
    id: 43,
    status: "approved",
    tags: ["SERVICE CAL"],
    source: "Referral",
    client: {
      name: "Michael Chang",
      email: "m.chang@techcorp.io",
    },
    location: "550 Market St",
    type: "Commercial Repair",
    phone: "(415) 309-8812",
    created: "Tue May 20, 2025 04:45 pm",
    modified: "Wed May 21, 2025 08:30 am",
  },
  {
    id: 42,
    status: "approved",
    tags: [],
    source: "Direct",
    client: {
      name: "Elena Rostova",
      email: "elena.r@designhub.com",
    },
    location: "789 Pine Ave",
    type: "CCTV Setup",
    phone: "(510) 902-1144",
    created: "Mon May 19, 2025 01:12 pm",
    modified: "Tue May 20, 2025 10:00 am",
  },
  {
    id: 41,
    status: "estimated",
    tags: ["URGENT"],
    source: "Google Ads",
    client: {
      name: "Robert Vance",
      email: "vance.r@realty.com",
    },
    location: "312 Oak Rd",
    type: "Access Control",
    phone: "(408) 661-3920",
    created: "Sun May 18, 2025 09:30 am",
    modified: "Mon May 19, 2025 11:00 am",
  },
  {
    id: 40,
    status: "estimated",
    tags: [],
    source: "Facebook",
    client: {
      name: "Amanda Miller",
      email: "amiller@gmail.com",
    },
    location: "901 Maple Terrace",
    type: "Tv Installation",
    phone: "(604) 441-2099",
    created: "Sat May 17, 2025 03:22 pm",
    modified: "Sun May 18, 2025 04:10 pm",
  },
];

export default function LeadsContent() {
  const { theme } = useTheme();
  const router = useRouter();

  // Filter & Search states
  const [leads, setLeads] = useState(initialLeads);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Status Filter Dropdown & Date Picker toggle
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("Aug 11th, 2026 - Aug 11th, 2026");

  // Calculate Metrics dynamically
  const metrics = useMemo(() => {
    const counts = {
      all: leads.length,
      new: 0,
      scheduled: 0,
      "in progress": 0,
      estimated: 0,
      approved: 0,
    };

    leads.forEach((item) => {
      const st = (item.status || "").toLowerCase();
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });

    return [
      { id: "all", label: "All", count: 21 },
      { id: "new", label: "New", count: 15 },
      { id: "scheduled", label: "Scheduled", count: 0 },
      { id: "in progress", label: "In progress", count: 1 },
      { id: "estimated", label: "Estimated", count: 3 },
      { id: "approved", label: "Approved", count: 2 },
    ];
  }, [leads]);

  // Filtered Leads dataset
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      // Category KPI Filter
      if (
        selectedFilterCategory !== "all" &&
        item.status.toLowerCase() !== selectedFilterCategory.toLowerCase()
      ) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const idMatch = String(item.id).includes(q);
        const nameMatch = item.client.name.toLowerCase().includes(q);
        const emailMatch = item.client.email.toLowerCase().includes(q);
        const phoneMatch = item.phone.includes(q);
        const typeMatch = item.type.toLowerCase().includes(q);
        const sourceMatch = item.source.toLowerCase().includes(q);
        return idMatch || nameMatch || emailMatch || phoneMatch || typeMatch || sourceMatch;
      }

      return true;
    });
  }, [leads, selectedFilterCategory, searchQuery]);

  // Checkbox Selection Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((i) => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  // Change inline status
  const handleStatusChange = (id, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    toast.success(`Lead #${id} status updated to ${newStatus}`);
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Client Name,Email,Phone,Status,Type,Source,Created"]
        .concat(
          filteredLeads.map(
            (l) =>
              `${l.id},"${l.client.name}","${l.client.email}","${l.phone}","${l.status}","${l.type}","${l.source}","${l.created}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pixlpro_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Leads CSV exported successfully!");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 pt-6 sm:pt-8 pb-16 px-3 sm:px-6 md:px-8">
      {/* Top Header: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Leads
        </h1>

        <div className="flex items-center gap-3">
          {/* Add New Button */}
          <button
            onClick={() => toast.info("Opening New Lead Form...")}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add new</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white dark:bg-[#0E1E31] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[#D31010] text-xs sm:text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Status Bar (Scrollable on mobile) */}
      <div className="w-full overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-3 min-w-[760px] sm:min-w-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 sm:grid">
          {metrics.map((metric) => {
            const isActive = selectedFilterCategory === metric.id;
            return (
              <div
                key={metric.id}
                onClick={() => setSelectedFilterCategory(metric.id)}
                className={`relative overflow-hidden bg-white dark:bg-[#061322]/80 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer select-none shadow-sm hover:shadow-md border ${
                  isActive
                    ? "border-slate-300 dark:border-slate-700 border-l-[4px] border-l-[#7A0000] shadow-md"
                    : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 pl-1">
                  {metric.label}
                </span>

                <div className="text-right mt-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {metric.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Control Box Container */}
      <div className="bg-white/90 dark:bg-[#061322]/70 backdrop-blur-xl border border-red-200/60 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter results accordion toggle */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#D31010] hover:text-[#b00d0d] transition-colors cursor-pointer"
          >
            <span>Filter results</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showFilterDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Collapsible Filter Dropdown */}
          <AnimatePresence>
            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 top-full mt-2 w-64 p-3 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 text-xs text-slate-700 dark:text-slate-200 space-y-2"
              >
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  Filter by Status:
                </p>
                {["all", "new", "in progress", "scheduled", "estimated", "approved"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedFilterCategory(cat);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg capitalize text-xs font-semibold flex items-center justify-between ${
                        selectedFilterCategory === cat
                          ? "bg-red-50 dark:bg-red-950/40 text-[#D31010]"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedFilterCategory === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Range Selector Picker Box */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 leading-tight">
              Recent 30 days including today
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {dateRangeText}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white/90 dark:bg-[#061322]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        {/* Table Inner Top Search Bar & Per Page Selector */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Search Input Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operations..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010] transition-all"
            />
          </div>

          {/* Rows Per Page Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Datatable Scroll Container */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 &&
                      selectedLeads.length === filteredLeads.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-14">ID</th>
                <th className="py-3 px-3 w-28">Status</th>
                <th className="py-3 px-3 w-28">Tags</th>
                <th className="py-3 px-3 w-24">Source</th>
                <th className="py-3 px-4 min-w-[160px]">Client</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Modified</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((item) => {
                  const isChecked = selectedLeads.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(item.id)}
                          className="w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.id}
                      </td>

                      {/* Status Dropdown Pill */}
                      <td className="py-3.5 px-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer outline-none capitalize ${
                            item.status === "new"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                              : item.status === "in progress"
                              ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                              : item.status === "approved"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                          }`}
                        >
                          <option value="new">new</option>
                          <option value="in progress">in pr...</option>
                          <option value="scheduled">scheduled</option>
                          <option value="estimated">estimated</option>
                          <option value="approved">approved</option>
                        </select>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-3">
                        {item.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-extrabold bg-[#2B7344] text-white rounded uppercase tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {item.source}
                      </td>

                      {/* Client (Name + Email Subtext) */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {item.client.name}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate max-w-[140px]">
                          {item.client.email}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                        {item.location || "-"}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.type}
                      </td>

                      {/* Phone Number (Red Highlighted) */}
                      <td className="py-3.5 px-3">
                        <a
                          href={`tel:${item.phone}`}
                          className="font-extrabold text-[#D31010] hover:underline"
                        >
                          {item.phone}
                        </a>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.created}
                      </td>

                      {/* Modified Date */}
                      <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.modified}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing 3 of 12</span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all ${
                  currentPage === num
                    ? "bg-[#D31010] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              disabled={currentPage === 3}
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
