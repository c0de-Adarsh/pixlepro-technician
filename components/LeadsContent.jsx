import React, { useState, useEffect, useMemo } from "react";
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
  Briefcase,
  RefreshCw,
  ArrowRightCircle,
  Trash2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function LeadsContent() {
  const { theme } = useTheme();
  const router = useRouter();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [convertingId, setConvertingId] = useState(null);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateRangeText, setDateRangeText] = useState("Recent 30 days");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await Api("GET", "api/events?is_lead=true", null, router);
      if (res) {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = raw.map((item) => {
          const shortId = item._id ? item._id.substring(item._id.length - 4) : item.id;
          const addr = item.address;
          const fullAddr = typeof addr === "object"
            ? `${addr.street || ""} ${addr.city || ""}`.trim()
            : (item.address || "");

          const createdDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Today";

          const modDate = item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : createdDate;

          return {
            id: shortId,
            _id: item._id,
            status: item.lead_status || item.status || "new",
            tags: Array.isArray(item.tags) ? item.tags : [],
            source: item.job_source || "Website",
            client: {
              name: item.client_name || "Client",
              email: item.email || "",
            },
            location: fullAddr || "-",
            type: item.job_type || item.title?.split(" - ")[0] || "Service Call",
            phone: item.phone || "-",
            created: createdDate,
            modified: modDate,
            rawItem: item,
          };
        });
        setLeads(mapped);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [router]);

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
      { id: "all", label: "All", count: counts.all },
      { id: "new", label: "New", count: counts.new },
      { id: "scheduled", label: "Scheduled", count: counts.scheduled },
      { id: "in progress", label: "In progress", count: counts["in progress"] },
      { id: "estimated", label: "Estimated", count: counts.estimated },
      { id: "approved", label: "Approved", count: counts.approved },
    ];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (
        selectedFilterCategory !== "all" &&
        item.status.toLowerCase() !== selectedFilterCategory.toLowerCase()
      ) {
        return false;
      }

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((l) => l._id || l.id));
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

  const handleStatusChange = async (targetId, newStatus) => {
    try {
      await Api("PUT", `api/events/${targetId}`, { lead_status: newStatus, status: newStatus }, router);
      setLeads((prev) =>
        prev.map((l) => (l._id === targetId || l.id === targetId ? { ...l, status: newStatus } : l))
      );
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleConvertToJob = async (lead) => {
    const targetId = lead._id || lead.id;
    try {
      setConvertingId(targetId);
      const res = await Api("POST", `api/events/${targetId}/convert`, {}, router);
      if (res && (res.success || res.data)) {
        toast.success(`Lead converted to Job! It is now visible on the Schedule & Jobs list.`);
        fetchLeads();
      } else {
        toast.error(res?.message || "Failed to convert lead");
      }
    } catch (err) {
      toast.error("Error converting lead to job");
    } finally {
      setConvertingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    try {
      await Promise.all(
        selectedLeads.map((id) => Api("DELETE", `api/events/${id}`, null, router))
      );
      toast.success(`Deleted ${selectedLeads.length} lead(s)`);
      setSelectedLeads([]);
      fetchLeads();
    } catch (err) {
      toast.error("Error deleting leads");
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.info("No leads to export");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Client Name,Email,Phone,Status,Type,Source,Location,Created"]
        .concat(
          filteredLeads.map(
            (l) =>
              `"${l.id}","${l.client.name}","${l.client.email}","${l.phone}","${l.status}","${l.type}","${l.source}","${l.location}","${l.created}"`
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
    <div className="w-full max-w-[1600px] mx-auto space-y-5 pt-6 sm:pt-8 pb-16 px-3 sm:px-6 md:px-8 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leads
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage incoming prospects and inquiries before converting them to scheduled jobs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/leads/new")}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add new</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white dark:bg-[#0E1E31] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[#D31010] text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-3 min-w-[760px] sm:min-w-0 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 sm:grid">
          {metrics.map((metric) => {
            const isActive = selectedFilterCategory === metric.id;
            return (
              <div
                key={metric.id}
                onClick={() => setSelectedFilterCategory(metric.id)}
                className={`relative overflow-hidden bg-white dark:bg-[#0E1E31] rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer select-none shadow-xs hover:shadow-md border ${
                  isActive
                    ? "border-slate-300 dark:border-slate-700 border-l-[4px] border-l-[#D31010] shadow-sm"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pl-1">
                  {metric.label}
                </span>

                <div className="text-right mt-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {metric.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-[#D31010] leading-tight">
              Recent 30 days including today
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {dateRangeText}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#D31010] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {selectedLeads.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-[#D31010] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedLeads.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                fetchLeads();
                toast.success("Leads refreshed");
              }}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 &&
                      selectedLeads.length === filteredLeads.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#D31010] accent-[#D31010] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">ID</th>
                <th className="py-3 px-3 w-28">Status</th>
                <th className="py-3 px-4 min-w-[160px]">Client</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-4 text-right">Convert</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No leads found. Click "Add new" to create one.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((item) => {
                  const targetId = item._id || item.id;
                  const isChecked = selectedLeads.includes(targetId);
                  const isConverting = convertingId === targetId;

                  return (
                    <tr
                      key={targetId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(targetId)}
                          className="w-4 h-4 rounded text-[#D31010] accent-[#D31010] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {item.id}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(targetId, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer outline-hidden capitalize ${
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
                          <option value="in progress">in progress</option>
                          <option value="scheduled">scheduled</option>
                          <option value="estimated">estimated</option>
                          <option value="approved">approved</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.client.name}
                        </div>
                        {item.client.email && (
                          <div className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]">
                            {item.client.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                        {item.location}
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                        {item.type}
                      </td>

                      <td className="py-3.5 px-3">
                        <a
                          href={`tel:${item.phone}`}
                          className="font-bold text-[#D31010] hover:underline"
                        >
                          {item.phone}
                        </a>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {item.source}
                      </td>

                      <td className="py-3.5 px-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.created}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleConvertToJob(item)}
                          disabled={isConverting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          title="Convert this lead into a scheduled Job"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{isConverting ? "Converting..." : "Convert to Job"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredLeads.length} of {leads.length} leads</span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              {currentPage}
            </span>

            <button
              disabled={currentPage >= Math.ceil(filteredLeads.length / rowsPerPage) || filteredLeads.length === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
