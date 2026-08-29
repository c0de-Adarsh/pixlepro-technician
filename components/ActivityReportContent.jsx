import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Laptop,
  Smartphone,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function ActivityReportContent() {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("All users");
  const [selectedPlatform, setSelectedPlatform] = useState("All platforms");
  const [userList, setUserList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRangeText, setDateRangeText] = useState("Today");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        user: selectedUser,
        platform: selectedPlatform,
      });

      const res = await Api("GET", `api/activities?${params.toString()}`, null, router);
      if (res && res.success) {
        setActivities(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.users && Array.isArray(res.users)) {
          setUserList(res.users);
        }
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, limit, selectedUser, selectedPlatform]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/activities/export`, "_blank");
    toast.success("Exporting activity report...");
  };

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = days[d.getDay()];
    const month = months[d.getMonth()];
    const dateNum = d.getDate();
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, "0");

    return `${day} ${month} ${dateNum}, ${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#071322] text-slate-700 dark:text-slate-200">
      {/* Breadcrumb top bar */}
      <div className="px-6 pt-4 pb-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
        <span>PRICE BOOK</span>
        <span>#</span>
        <span>LEADS REPORT</span>
        <span>#</span>
        <span>LEADS</span>
        <span>#</span>
        <span>ITEMS REPORT</span>
        <span>#</span>
        <button
          onClick={() => router.push("/reports")}
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          REPORTS
        </button>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">ACTIVITY</span>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
     
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    
          <div className="relative flex-1 max-w-md">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedUser !== "All users" ? `User: ${selectedUser}` : selectedPlatform !== "All platforms" ? `Platform: ${selectedPlatform}` : "Filter results"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-40 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Filter by User
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => {
                        setSelectedUser(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
                    >
                      <option value="All users">All users</option>
                      {userList.map((u, i) => (
                        <option key={i} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Filter by Platform
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => {
                        setSelectedPlatform(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
                    >
                      <option value="All platforms">All platforms</option>
                      <option value="web">Web (Desktop/Laptop)</option>
                      <option value="mobile">Mobile App</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedUser("All users");
                        setSelectedPlatform("All platforms");
                        setPage(1);
                        setIsFilterDropdownOpen(false);
                      }}
                      className="text-[11px] text-[#D31010] hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date range right card */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex flex-col items-end justify-center px-4 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-lg text-right shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors min-w-[200px]"
            >
              <span className="text-[11px] text-slate-400 font-medium">{dateRangeText}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Aug 27th, 2026 - Aug 27th, 2026
              </span>
            </button>

            {isDateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsDateDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-40 text-xs">
                  {["Today", "Yesterday", "This Week", "Last 7 Days", "This Month", "All Time"].map((dr) => (
                    <button
                      key={dr}
                      onClick={() => {
                        setDateRangeText(dr);
                        setIsDateDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs transition-colors"
                    >
                      {dr}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls Bar: Search, Page limit, Export */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden focus:border-slate-400 transition-colors text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-hidden cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4 w-[240px]">Time</th>
                  <th className="py-3 px-4 w-[220px]">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4 w-[120px]">Job Id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                        <span>Loading activity logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No activity logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => {
                    const isMobile = item.platform === "mobile" || item.platform === "app";
                    return (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Time */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatActivityTime(item.timestamp)}
                        </td>

                        {/* User */}
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {item.user_name || "-"}
                        </td>

                        {/* Action + Platform Icon */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>{item.action}</span>
                            {isMobile ? (
                              <span title="Mobile App">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              </span>
                            ) : (
                              <span title="Web Application">
                                <Laptop className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Job ID */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.job_id ? (
                            <button
                              onClick={() => router.push(`/jobs`)}
                              className="text-slate-700 dark:text-slate-300 hover:text-[#D31010] hover:underline cursor-pointer"
                            >
                              {item.job_id}
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
