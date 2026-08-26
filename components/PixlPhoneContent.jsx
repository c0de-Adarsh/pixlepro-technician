import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Search,
  Headphones,
  Download,
  Plus,
  ChevronDown,
  PhoneCall,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const sampleCallsData = [
  {
    id: 1,
    status: "Missed",
    from: "+1 (555) 234-5678",
    to: "+1 (800) 749-5776",
    time: "Today, 10:42 AM",
    callFlow: "Main IVR",
    adSource: "Google Ads",
    tags: ["New Lead"],
    answeredBy: "Unanswered",
    jobsLeads: "Lead #1042",
    revenue: "$0.00",
  },
  {
    id: 2,
    status: "Completed",
    from: "+1 (555) 876-5432",
    to: "+1 (800) 749-5776",
    time: "Today, 09:15 AM",
    callFlow: "Sales Queue",
    adSource: "Direct Web",
    tags: ["Job Scheduled"],
    answeredBy: "Sarah Jenkins",
    jobsLeads: "Job #8821",
    revenue: "$1,250.00",
  },
  {
    id: 3,
    status: "Completed",
    from: "+1 (555) 345-6789",
    to: "+1 (800) 749-5776",
    time: "Yesterday, 4:30 PM",
    callFlow: "Support Queue",
    adSource: "Facebook",
    tags: ["Client"],
    answeredBy: "Alex Rivera",
    jobsLeads: "Client #402",
    revenue: "$350.00",
  },
];

export default function PixlPhoneContent() {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState("Calls");
  const [dateRange, setDateRange] = useState("Aug 11th, 2026 - Aug 11th, 2026");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTableTab, setActiveTableTab] = useState("Time");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callsList, setCallsList] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const subTabs = [
    "Calls",
    "Phone numbers",
    "Call flows",
    "Call masking",
    "Call groups",
    "Blocked callers",
  ];

  const tableHeaderColumns = [
    "Status",
    "From",
    "To",
    "Time",
    "Call Flow",
    "Ad Source",
    "Tags",
    "Answered By",
    "Jobs & Leads",
    "Revenue",
  ];

  const handleMakeCall = (e) => {
    e.preventDefault();
    if (!newPhoneNumber) return;
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      setShowCallModal(false);
      setCallsList([
        {
          id: Date.now(),
          status: "Completed",
          from: newPhoneNumber,
          to: "+1 (888) PIXL-PRO",
          time: "Just now",
          callFlow: "Direct Call",
          adSource: "Manual Dial",
          tags: ["Outbound"],
          answeredBy: "Admin",
          jobsLeads: "New Lead",
          revenue: "$0.00",
        },
        ...callsList,
      ]);
      setNewPhoneNumber("");
    }, 1200);
  };

  const handleAddFilterClick = () => {
    if (callsList.length === 0) {
      setCallsList(sampleCallsData);
    } else {
      setCallsList([]);
    }
  };

  const filteredCalls = callsList.filter(
    (item) =>
      item.from.includes(searchQuery) ||
      item.to.includes(searchQuery) ||
      item.answeredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gridRows = Array.from({ length: 8 });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            PiXL Phone
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF0F0] dark:bg-red-950/40 text-[#D31010] dark:text-red-400 border border-red-200/60 dark:border-red-900/40 rounded-full text-xs font-semibold">
            <Phone className="w-3.5 h-3.5" />
            <span>(8xx) xxx-xxxx</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium self-start md:self-auto">
          <span className="text-slate-500 dark:text-slate-400">Phone plan usage</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="ml-1 px-3 py-1 bg-[#FFF0F0] dark:bg-red-950/50 text-[#D31010] dark:text-red-400 border border-red-200/70 dark:border-red-900/60 rounded-full font-bold">
            limits reached
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200/80 dark:border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 min-w-max">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-3 text-sm font-semibold relative transition-colors ${
                  isActive
                    ? "text-[#D31010] dark:text-red-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="activeSubTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D31010]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="relative self-start">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0E1E31]/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold shadow-sm hover:border-slate-300 transition-colors"
          >
            <span className="text-slate-900 dark:text-white font-bold">Today</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showDateDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 z-30 text-xs">
              {[
                "Aug 11th, 2026 - Aug 11th, 2026",
                "Last 7 Days",
                "Last 30 Days",
                "This Month",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-slate-700 dark:text-slate-200 font-medium"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAddFilterClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#0E1E31]/80 text-[#D31010] dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-semibold shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            MISSED CALLS
          </p>
          <p className="text-3xl font-extrabold text-[#D31010]">
            {callsList.filter((c) => c.status === "Missed").length}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            CALLS
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-[#D31010]">
              {callsList.length}
            </p>
            <span className="text-xs text-slate-400 font-medium">callers</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            DISPATCHER SCORE
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-extrabold text-slate-300 dark:text-slate-600">
              0
            </p>
            <span className="text-xs text-slate-400 font-medium">out of 100</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            CONVERSION RATE
          </p>
          <p className="text-3xl font-extrabold text-slate-300 dark:text-slate-600">
            0.0%
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">
            REVENUE
          </p>
          <p className="text-3xl font-extrabold text-[#D31010]">
            $0.00
          </p>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-[#081525]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search operations..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/80 dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <Headphones className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#061322] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold shadow-sm">
              <span>{rowsPerPage}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-[#061322] text-[#D31010] dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative min-w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#FDE8E8] dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold bg-white dark:bg-[#081525]">
                {tableHeaderColumns.map((col) => {
                  const isAct = activeTableTab === col;
                  return (
                    <th
                      key={col}
                      onClick={() => setActiveTableTab(col)}
                      className={`px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 cursor-pointer transition-colors relative whitespace-nowrap ${
                        isAct
                          ? "text-[#D31010] dark:text-red-400 font-bold"
                          : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{col}</span>
                      {isAct && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D31010]" />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {filteredCalls.length > 0 ? (
              <tbody>
                {filteredCalls.map((call, idx) => (
                  <tr
                    key={call.id}
                    className={`border-b border-[#FDE8E8] dark:border-white/5 transition-colors text-slate-700 dark:text-slate-200 ${
                      idx % 2 === 1
                        ? "bg-[#FFF5F5] dark:bg-[#0D2138]/60"
                        : "bg-white dark:bg-[#061322]/60"
                    }`}
                  >
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 font-semibold">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] ${
                          call.status === "Missed"
                            ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        }`}
                      >
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 font-medium">{call.from}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 font-medium">{call.to}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 text-slate-500 dark:text-slate-400">{call.time}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5">{call.callFlow}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5">{call.adSource}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5">
                      {call.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] mr-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5">{call.answeredBy}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 text-[#D31010] dark:text-red-400 font-semibold">{call.jobsLeads}</td>
                    <td className="px-4 py-3.5 border-r border-[#FDE8E8] dark:border-white/5 font-bold">{call.revenue}</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody className="relative">
                {gridRows.map((_, rowIdx) => {
                  const isRowShaded = rowIdx % 2 === 1;
                  return (
                    <tr
                      key={`grid-row-${rowIdx}`}
                      className={`h-11 border-b border-[#FDE8E8] dark:border-white/5 ${
                        isRowShaded
                          ? "bg-[#FFF2F2]/80 dark:bg-[#0D2138]/60"
                          : "bg-white dark:bg-[#061322]/60"
                      }`}
                    >
                      {tableHeaderColumns.map((col, colIdx) => (
                        <td
                          key={`grid-cell-${rowIdx}-${colIdx}`}
                          className="border-r border-[#FDE8E8] dark:border-white/5 p-0"
                        />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>

          {filteredCalls.length === 0 && (
            <div className="absolute inset-0 top-[45px] flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto py-6 px-4 flex flex-col items-center justify-center text-center space-y-3">
                <div className="text-[#D31010] dark:text-red-400">
                  <PhoneCall className="w-9 h-9 stroke-[1.5]" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No calls yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Your call history is empty. Start making or receiving calls to see them here
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCallModal(true)}
                  className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  Make a call
                </motion.button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing 3 of 12</span>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? "bg-[#D31010] text-white shadow-sm"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`w-6 h-6 rounded-md font-medium text-xs flex items-center justify-center transition-colors ${
                currentPage === 2
                  ? "bg-[#D31010] text-white shadow-sm"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              2
            </button>

            <button
              onClick={() => setCurrentPage(3)}
              className={`w-6 h-6 rounded-md font-medium text-xs flex items-center justify-center transition-colors ${
                currentPage === 3
                  ? "bg-[#D31010] text-white shadow-sm"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              3
            </button>

            <button className="p-1 text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCallModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-xl text-[#D31010]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Make a Call
                  </h3>
                </div>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleMakeCall} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCallModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCalling}
                    className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    {isCalling ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Dialing...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-3.5 h-3.5" />
                        <span>Start Call</span>
                      </>
                    )}
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
