import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  User,
  Phone,
  Tag,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import EditJobDrawer from "./EditJobDrawer";
import ClientDetailDrawer from "./ClientDetailDrawer";

export default function JobsContent() {
  const { theme } = useTheme();
  const router = useRouter();

  // State Management
  const [jobs, setJobs] = useState([]);
  const [activeStatusTab, setActiveStatusTab] = useState("submitted");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClientForDrawer, setSelectedClientForDrawer] = useState(null);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);

  const normalizeStatus = (st) => {
    if (!st) return "submitted";
    const s = String(st).toLowerCase().trim();
    if (s === "open" || s === "submitted" || s === "new") return "submitted";
    if (s === "in progress" || s === "inprogress" || s === "in-progress") return "in progress";
    if (s === "pending") return "pending";
    if (s === "completed" || s === "done pending approval" || s === "done") return "done pending approval";
    if (s === "unscheduled") return "unscheduled";
    return "submitted";
  };

  const formatScheduleDate = (dateVal, timeVal) => {
    if (!dateVal) return "Unscheduled";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return `${dateVal} ${timeVal || ""}`.trim();
      const formattedDate = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return `${formattedDate} ${timeVal || ""}`.trim();
    } catch (err) {
      return `${String(dateVal).split("T")[0]} ${timeVal || ""}`.trim();
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await Api("GET", "api/events", null, router);
      if (res) {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const nonLeads = raw.filter((e) => !e.is_lead && e.type !== "lead" && e.status !== "lead");
        if (nonLeads.length > 0) {
          const mapped = nonLeads.map((e) => {
            const shortId = e._id ? e._id.substring(e._id.length - 4) : (e.id || "1065");
            const addr = e.address;
            const formattedAddr = typeof addr === "object"
              ? `${addr.street || ""} ${addr.unit || ""}, ${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""}`.trim()
              : (e.address || "");
            const sched = formatScheduleDate(e.schedule?.start_date || e.start_date, e.schedule?.start_time || e.start_time);
            return {
              id: shortId,
              _id: e._id || e.id || shortId,
              jobId: shortId,
              title: e.title || `Job #${shortId}`,
              clientName: e.client_name || "Client",
              companyName: e.company_name || "",
              status: normalizeStatus(e.status),
              client: {
                name: e.client_name || "Client",
                email: e.email || "",
              },
              tags: Array.isArray(e.tags) ? e.tags : [],
              jobType: e.job_type || e.title?.split(" - ")[0] || "CAPTURE TV",
              serviceArea: e.service_area || "Edmonton",
              scheduled: sched,
              scheduledSubtext: e.schedule?.start_date ? "scheduled" : "",
              startDate: e.schedule?.start_date ? String(e.schedule.start_date).split("T")[0] : "2026-08-20",
              startTime: e.schedule?.start_time || "07:45 AM",
              endDate: e.schedule?.end_date ? String(e.schedule.end_date).split("T")[0] : "2026-08-20",
              endTime: e.schedule?.end_time || "07:50 AM",
              isAllDay: e.schedule?.is_all_day || false,
              phone: e.phone || "",
              email: e.email || "",
              assignedTechs: Array.isArray(e.assigned_techs) && e.assigned_techs.length > 0 ? e.assigned_techs : (Array.isArray(e.team_members) ? e.team_members : (e.assigned_tech ? [e.assigned_tech] : ["PIXL TECHNICIAN"])),
              tech: e.assigned_tech || (Array.isArray(e.assigned_techs) ? e.assigned_techs[0] : null),
              address: formattedAddr || "Lucknow Main Street",
              timeInStatus: "1 DAY",
              totalPrice: e.total_amount ? `$${Number(e.total_amount).toFixed(2)}` : (e.total ? `$${Number(e.total).toFixed(2)}` : "$0.00"),
              total_amount: e.total_amount || e.total || 0,
              balance_due: e.balance_due || e.total_amount || 0,
              line_items: Array.isArray(e.line_items) ? e.line_items : [],
              notes: e.description || "",
              description: e.description || "",
              jobName: e.title ? e.title.split(" - ")[0] : "",
              source: e.job_source || "Google",
              isUnpaid: true,
            };
          });
          setJobs(mapped);
        } else {
          setJobs([]);
        }
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [router]);

  // Status Tabs Data
  const statusTabs = useMemo(() => {
    const getCount = (st) => jobs.filter((j) => j.status.toLowerCase() === st).length;
    return [
      { id: "submitted", label: "Submitted", count: getCount("submitted") },
      { id: "in progress", label: "In Progress", count: getCount("in progress") },
      { id: "pending", label: "Pending", count: getCount("pending") },
      { id: "done pending approval", label: "Done Pending Approval", count: getCount("done pending approval") },
      { id: "unscheduled", label: "Unscheduled", count: getCount("unscheduled") },
    ];
  }, [jobs]);

  // Filtered Jobs dataset
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Active Status Tab Filter
      if (
        activeStatusTab &&
        job.status.toLowerCase() !== activeStatusTab.toLowerCase()
      ) {
        return false;
      }

      // Show Unpaid Only Filter
      if (showUnpaidOnly && !job.isUnpaid) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const idMatch = String(job.id).includes(q);
        const nameMatch = job.client.name.toLowerCase().includes(q);
        const emailMatch = job.client.email.toLowerCase().includes(q);
        const phoneMatch = job.phone.includes(q);
        const typeMatch = job.jobType.toLowerCase().includes(q);
        const addressMatch = job.address.toLowerCase().includes(q);
        return (
          idMatch ||
          nameMatch ||
          emailMatch ||
          phoneMatch ||
          typeMatch ||
          addressMatch
        );
      }

      return true;
    });
  }, [jobs, activeStatusTab, showUnpaidOnly, searchQuery]);

  // Export CSV Action
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["JOB ID,Client Name,Email,Job Type,Scheduled,Phone,Address,Time In Status,Price,Source"]
        .concat(
          filteredJobs.map(
            (j) =>
              `${j.id},"${j.client.name}","${j.client.email}","${j.jobType}","${j.scheduled}","${j.phone}","${j.address}","${j.timeInStatus}","${j.totalPrice}","${j.source}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pixlpro_jobs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Jobs CSV exported successfully!");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 pt-6 sm:pt-8 pb-16 px-3 sm:px-6 md:px-8">
      {/* Top Header: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Jobs
        </h1>

        <div className="flex items-center gap-3">
          {/* Add New Button */}
          <button
            onClick={() => router.push("/jobs/new")}
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

      {/* Filter Control Box Container */}
      <div className="bg-white/90 dark:bg-[#061322]/70 backdrop-blur-xl border border-red-200/60 dark:border-white/10 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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
                  Filter Status:
                </p>
                {statusTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveStatusTab(t.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      activeStatusTab === t.id
                        ? "bg-red-50 dark:bg-red-950/40 text-[#D31010]"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {t.count}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Horizontal Status Tabs Bar */}
      <div className="w-full overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-slate-800 pb-1">
        <div className="flex items-center gap-6 min-w-max">
          {statusTabs.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`pb-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer relative ${
                  isActive
                    ? "text-[#D31010] dark:text-[#F87171]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                  {tab.count}
                </span>

                {/* Active Bottom Red Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeJobStatusTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D31010]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white/90 dark:bg-[#061322]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        {/* Search Bar & Checkbox Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Left Search Input */}
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

          {/* Center Checkbox: Show unpaid jobs */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUnpaidOnly}
              onChange={(e) => setShowUnpaidOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <span>Show unpaid jobs</span>
          </label>

          {/* Right Rows Per Page Selector */}
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
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3 px-3 w-16">JOB ID</th>
                <th className="py-3 px-4 min-w-[160px]">CLIENT</th>
                <th className="py-3 px-3">TAGS</th>
                <th className="py-3 px-3">JOB TYPE</th>
                <th className="py-3 px-4">SCHEDULED</th>
                <th className="py-3 px-3">PHONE</th>
                <th className="py-3 px-3">TECH</th>
                <th className="py-3 px-4">ADDRESS</th>
                <th className="py-3 px-3">TIME IN S...</th>
                <th className="py-3 px-3">TOTAL PRICE</th>
                <th className="py-3 px-3">JOB NAME</th>
                <th className="py-3 px-3">SOURCE</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      router.push(`/jobs/${item._id || item.id}`);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Job ID */}
                    <td
                      className="py-4 px-3 font-bold text-slate-900 dark:text-white hover:text-[#D31010] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobForDrawer(item);
                        setIsDrawerOpen(true);
                      }}
                    >
                      {item.id}
                    </td>

                    {/* Client (Name + Email Subtext) */}
                    <td
                      className="py-4 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClientForDrawer({
                          clientName: item.clientName || item.client?.name || item.title || "Client",
                          companyName: item.companyName || "",
                          phone: item.phone || item.client?.phone || "",
                          secondaryPhone: item.phone || "",
                          email: item.email || item.client?.email || "",
                          address: item.address || "",
                          jobId: item.jobId || item._id || item.id,
                          jobTitle: item.title || item.jobName || "",
                          scheduled: item.scheduled || "",
                          tech: item.tech || "PIXL TECHNICIAN",
                          clientId: item.clientId || item._id || item.id,
                          source: item.source || "web",
                          tags: Array.isArray(item.tags) ? item.tags : [],
                        });
                        setIsClientDrawerOpen(true);
                      }}
                    >
                      <div className="font-extrabold text-slate-900 dark:text-white hover:text-[#D31010] cursor-pointer">
                        {item.client.name}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate max-w-[140px]">
                        {item.companyName || item.client.email}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-3">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[9px] font-extrabold bg-[#4B5563] text-white rounded uppercase tracking-wider inline-block text-center"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>

                    {/* Job Type */}
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {item.jobType}
                    </td>

                    {/* Scheduled (Date + Red Elapsed Subtext) */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {item.scheduled}
                      </div>
                      {item.scheduledSubtext ? (
                        <div className="text-[11px] font-bold text-red-600 dark:text-red-400">
                          {item.scheduledSubtext}
                        </div>
                      ) : null}
                    </td>

                    {/* Phone Number (Red Highlighted) */}
                    <td className="py-4 px-3">
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          className="font-extrabold text-[#D31010] hover:underline"
                        >
                          {item.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Tech Avatar / Badge */}
                    <td className="py-4 px-3">
                      {item.tech ? (
                        <div className="w-6 h-5 bg-emerald-600 text-white rounded text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                          ✓
                        </div>
                      ) : null}
                    </td>

                    {/* Address */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
                      {item.address}
                    </td>

                    {/* Time in Status Badge (Red Square) */}
                    <td className="py-4 px-3">
                      <span className="px-2 py-1 bg-[#800000] text-white text-[10px] font-extrabold rounded leading-none uppercase tracking-wider inline-block">
                        {item.timeInStatus}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-3 font-extrabold text-slate-900 dark:text-white">
                      {item.totalPrice}
                    </td>

                    {/* Job Name */}
                    <td className="py-4 px-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.jobName || "-"}
                    </td>

                    {/* Source */}
                    <td className="py-4 px-3 text-slate-600 dark:text-slate-400">
                      {item.source}
                    </td>
                  </tr>
                ))
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
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
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
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Job Quick Details Drawer */}
      <EditJobDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        job={selectedJobForDrawer}
        onJobUpdated={() => {
          fetchJobs();
        }}
      />

      {/* Slide-Over Client Quick Details Drawer */}
      <ClientDetailDrawer
        isOpen={isClientDrawerOpen}
        onClose={() => setIsClientDrawerOpen(false)}
        client={selectedClientForDrawer}
      />
    </div>
  );
}
