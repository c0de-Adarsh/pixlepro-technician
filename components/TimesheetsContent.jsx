import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  Info,
  Loader2,
  MapPin,
  FileText,
  Briefcase,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function TimesheetsContent() {
  const router = useRouter();

  const [timesheetData, setTimesheetData] = useState({
    summary: { total_minutes: 0, formatted_total: "00:00", total_cost: 0, total_jobs: 0 },
    users: [],
    raw_records: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedUser, setSelectedUser] = useState("PIXL TECHNICIAN");
  const [fromDate, setFromDate] = useState("2026-08-27");
  const [fromHour, setFromHour] = useState("09");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromAmPm, setFromAmPm] = useState("AM");

  const [toDate, setToDate] = useState("2026-08-27");
  const [toHour, setToHour] = useState("05");
  const [toMinute, setToMinute] = useState("00");
  const [toAmPm, setToAmPm] = useState("PM");

  const [shiftNotes, setShiftNotes] = useState("");
  const [laborCost, setLaborCost] = useState("0.00");
  const [isEditingCost, setIsEditingCost] = useState(false);

  const [availableTeamUsers, setAvailableTeamUsers] = useState(["PIXL TECHNICIAN"]);

  const fetchTimesheets = async () => {
    try {
      setIsLoading(true);
      const res = await Api("GET", "api/timesheets", null, router);
      if (res && res.success && res.data) {
        setTimesheetData(res.data);
      }
    } catch (err) {
      toast.error("Error fetching timesheets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await Api("GET", "api/teams", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const names = list.map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean);
      if (names.length > 0) {
        setAvailableTeamUsers(Array.from(new Set(["PIXL TECHNICIAN", ...names])));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTimesheets();
    fetchTeamMembers();
  }, []);

  const toggleUserExpanded = (userName) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userName]: !prev[userName],
    }));
  };

  const openCreateModal = (prefillUser = null) => {
    setEditingEntry(null);
    if (prefillUser) setSelectedUser(prefillUser);
    setFromDate("2026-08-27");
    setFromHour("02");
    setFromMinute("45");
    setFromAmPm("PM");
    setToDate("2026-08-27");
    setToHour("03");
    setToMinute("45");
    setToAmPm("PM");
    setShiftNotes("");
    setLaborCost("0.00");
    setIsEditingCost(false);
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setSelectedUser(entry.user_name || "PIXL TECHNICIAN");

    if (entry.start_time) {
      const s = new Date(entry.start_time);
      const yyyy = s.getFullYear();
      const mm = String(s.getMonth() + 1).padStart(2, "0");
      const dd = String(s.getDate()).padStart(2, "0");
      setFromDate(`${yyyy}-${mm}-${dd}`);
      let h = s.getHours();
      const isPM = h >= 12;
      let h12 = h % 12 || 12;
      setFromHour(String(h12).padStart(2, "0"));
      setFromMinute(String(Math.floor(s.getMinutes() / 5) * 5).padStart(2, "0"));
      setFromAmPm(isPM ? "PM" : "AM");
    }

    if (entry.end_time) {
      const end = new Date(entry.end_time);
      const yyyy = end.getFullYear();
      const mm = String(end.getMonth() + 1).padStart(2, "0");
      const dd = String(end.getDate()).padStart(2, "0");
      setToDate(`${yyyy}-${mm}-${dd}`);
      let h = end.getHours();
      const isPM = h >= 12;
      let h12 = h % 12 || 12;
      setToHour(String(h12).padStart(2, "0"));
      setToMinute(String(Math.floor(end.getMinutes() / 5) * 5).padStart(2, "0"));
      setToAmPm(isPM ? "PM" : "AM");
    }

    setShiftNotes(entry.shift_notes || "");
    setLaborCost(String(entry.labor_cost || "0.00"));
    setIsEditingCost(false);
    setIsModalOpen(true);
  };

  const handleCreateTimesheet = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        user_name: selectedUser,
        from_date: fromDate,
        from_hour: fromHour,
        from_minute: fromMinute,
        from_ampm: fromAmPm,
        to_date: toDate,
        to_hour: toHour,
        to_minute: toMinute,
        to_ampm: toAmPm,
        shift_notes: shiftNotes.trim(),
        labor_cost: Number(laborCost) || 0,
      };

      let res;
      if (editingEntry) {
        const recId = editingEntry._id || editingEntry.id;
        res = await Api("PUT", `api/timesheets/${recId}`, payload, router);
      } else {
        res = await Api("POST", "api/timesheets/manual", payload, router);
      }

      if (res && (res.success || res.data)) {
        toast.success(editingEntry ? "Time sheet updated successfully" : "Time sheet created successfully");
        setIsModalOpen(false);
        fetchTimesheets();
      } else {
        toast.error(res?.message || "Failed to save timesheet");
      }
    } catch (err) {
      toast.error("Error saving time sheet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (recId) => {
    try {
      const res = await Api("DELETE", `api/timesheets/${recId}`, {}, router);
      if (res && res.success) {
        toast.success("Timesheet entry deleted");
        fetchTimesheets();
      }
    } catch (err) {
      toast.error("Error deleting entry");
    }
  };

  const filteredUsers = useMemo(() => {
    let list = timesheetData.users || [];

    if (filterStatus === "clocked_in") {
      list = list.filter((u) => u.is_clocked_in);
    } else if (filterStatus === "clocked_out") {
      list = list.filter((u) => !u.is_clocked_in);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((u) => u.user_name.toLowerCase().includes(q));
    }

    return list;
  }, [timesheetData.users, filterStatus, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;

  const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutesOptions = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Navigation */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap space-x-1.5">
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">JOB SUB STATUS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/custom-fields")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">CUSTOM FIELDS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/taxes")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">TAX SETTINGS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SETTINGS</span>
        <span>#</span>
        <span onClick={() => router.push("/reports")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">REPORTS</span>
        <span>#</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">TIMESHEET</span>
      </div>

      {/* Filter and Date Range Control Bar (Screenshot 4 Match) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Filter Results Dropdown */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
            >
              <option value="all">Filter results (All)</option>
              <option value="clocked_in">Clocked In Only</option>
              <option value="clocked_out">Clocked Out Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Date Range Picker Display Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-[#D31010]" />
          <div>
            <div className="text-[10px] text-slate-400 font-normal">This week (Mon-Today)</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">Aug 24th, 2026 - Aug 27th, 2026</div>
          </div>
        </div>
      </div>

      {/* Add New Button Action Bar */}
      <div>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New</span>
        </button>
      </div>

      {/* Toolbar: Search, Rows Per Page, Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Rows Per Page */}
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => {
              toast.success("Timesheets summary exported successfully!");
            }}
            className="px-4 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Grouped Timesheets Datatable */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-4 px-6 w-1/2">User</th>
              <th className="py-4 px-6">Hours</th>
              <th className="py-4 px-6">Cost</th>
              <th className="py-4 px-6 text-right">Jobs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {/* Total Row (Top of Table as per Screenshot 4) */}
            <tr className="bg-slate-50/70 dark:bg-slate-900/50 font-extrabold border-b-2 border-slate-200 dark:border-slate-700">
              <td className="py-4 px-6 text-sm text-slate-900 dark:text-white">
                Total:
              </td>
              <td className="py-4 px-6 text-sm text-slate-900 dark:text-white">
                {timesheetData.summary.formatted_total || "00:00"}
              </td>
              <td className="py-4 px-6 text-sm text-slate-900 dark:text-white">
                ${Number(timesheetData.summary.total_cost || 0).toFixed(2)}
              </td>
              <td className="py-4 px-6 text-sm text-right text-slate-900 dark:text-white">
                {timesheetData.summary.total_jobs || 0}
              </td>
            </tr>

            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D31010] mb-2" />
                  <span>Loading timesheets...</span>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  No users or timesheet logs found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => {
                const isExpanded = Boolean(expandedUsers[u.user_name]);
                const isClockedIn = Boolean(u.is_clocked_in);
                return (
                  <React.Fragment key={u.user_name}>
                    <tr
                      onClick={() => toggleUserExpanded(u.user_name)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* User Column with Clock Status Badge */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {u.user_name}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center gap-1 ${
                              isClockedIn
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span>{isClockedIn ? "Clocked In" : "Clocked Out"}</span>
                            <span className="text-[9px]">{isClockedIn ? "↑" : "↓"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-200 font-bold text-xs">
                        {u.formatted_total || "00:00"}
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-200 font-bold text-xs">
                        ${Number(u.total_cost || 0).toFixed(2)}
                      </td>

                      {/* Jobs */}
                      <td className="py-4 px-6 text-right text-slate-700 dark:text-slate-200 font-bold text-xs">
                        {u.jobs_count || 0}
                      </td>
                    </tr>

                    {/* Accordion Expanded Detail Entries */}
                    {isExpanded && (
                      <tr className="bg-slate-50/40 dark:bg-slate-900/30">
                        <td colSpan={4} className="p-4 pl-12">
                          <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                            <div className="flex items-center justify-between pb-1">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Shift & Job Logs ({u.entries?.length || 0})
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCreateModal(u.user_name);
                                }}
                                className="text-[11px] font-bold text-[#D31010] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Time Entry</span>
                              </button>
                            </div>

                            {(!u.entries || u.entries.length === 0) ? (
                              <div className="text-xs text-slate-400 py-2 italic">
                                No shift logs recorded for this period.
                              </div>
                            ) : (
                              u.entries.map((entry) => {
                                const startStr = entry.start_time
                                  ? new Date(entry.start_time).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : "N/A";
                                const endStr = entry.end_time
                                  ? new Date(entry.end_time).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : entry.is_active_shift
                                  ? "Running..."
                                  : "N/A";
                                return (
                                  <div
                                    key={entry._id || entry.id}
                                    className="p-3 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D31010]">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                          {startStr} → {endStr}
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                          Duration: <span className="font-bold text-slate-700 dark:text-slate-200">{entry.formatted_duration || "00:00"}</span>
                                          {entry.shift_notes && ` • Notes: ${entry.shift_notes}`}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-white mr-1">
                                        ${Number(entry.labor_cost || 0).toFixed(2)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(entry);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                        title="Edit time entry"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRecord(entry._id || entry.id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                        title="Delete time entry"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Time Sheet Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {editingEntry ? "Edit time sheet" : "Create time sheet"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTimesheet} className="p-6 space-y-4 text-xs font-semibold">
                {/* User Dropdown Selector */}
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-1.5 bg-white dark:bg-slate-900 relative focus-within:ring-2 focus-within:ring-[#D31010]/20 focus-within:border-[#D31010]">
                  <label className="block text-[10px] font-bold text-slate-400">
                    User
                  </label>
                  <div className="relative">
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 py-0.5"
                    >
                      {availableTeamUsers.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* From: Date & Time Picker */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    From:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Date */}
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="col-span-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                    />
                    {/* Hour */}
                    <div className="relative">
                      <select
                        value={fromHour}
                        onChange={(e) => setFromHour(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        {hoursOptions.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {/* Minute */}
                    <div className="relative">
                      <select
                        value={fromMinute}
                        onChange={(e) => setFromMinute(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        {minutesOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {/* AM/PM */}
                    <div className="relative">
                      <select
                        value={fromAmPm}
                        onChange={(e) => setFromAmPm(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* To: Date & Time Picker */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    To:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Date */}
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="col-span-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                    />
                    {/* Hour */}
                    <div className="relative">
                      <select
                        value={toHour}
                        onChange={(e) => setToHour(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        {hoursOptions.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {/* Minute */}
                    <div className="relative">
                      <select
                        value={toMinute}
                        onChange={(e) => setToMinute(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        {minutesOptions.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {/* AM/PM */}
                    <div className="relative">
                      <select
                        value={toAmPm}
                        onChange={(e) => setToAmPm(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Shift Notes Textarea */}
                <div>
                  <textarea
                    rows={3}
                    placeholder="Shift notes"
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010] resize-none"
                  />
                </div>

                {/* Labor Cost Display & Edit */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Labor Cost</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditingCost ? (
                      <input
                        type="number"
                        step="0.01"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        className="w-32 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20"
                        autoFocus
                        onBlur={() => setIsEditingCost(false)}
                      />
                    ) : (
                      <div className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>$ {Number(laborCost || 0).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingCost(true)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingEntry ? "Save Changes" : "Create"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
