import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Search,
  Headphones,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Filter,
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

const workizDateOptions = [
  "Custom",
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last month",
  "This month",
  "This year",
  "Last year",
  "This week (Sun-Today)",
  "This week (Mon-Today)",
  "Last week (Sun-Sat)",
  "Last week (Mon-Sun)",
  "Last business week (Mon-Fri)",
];

function getDateSubtext(preset, customStart, customEnd) {
  const now = new Date();

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatWithOrdinal = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = getOrdinal(date.getDate());
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  if (preset === "Custom") {
    if (customStart && customEnd) {
      return `${formatWithOrdinal(new Date(customStart))} – ${formatWithOrdinal(new Date(customEnd))}`;
    }
    return "Select custom range";
  }

  if (preset === "Today") {
    return `${formatWithOrdinal(now)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Yesterday") {
    const y = new Date();
    y.setDate(now.getDate() - 1);
    return `${formatWithOrdinal(y)} – ${formatWithOrdinal(y)}`;
  }

  if (preset === "Last 7 days") {
    const s = new Date();
    s.setDate(now.getDate() - 6);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Last 14 days") {
    const s = new Date();
    s.setDate(now.getDate() - 13);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Last 30 days") {
    const s = new Date();
    s.setDate(now.getDate() - 29);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Last month") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(e)}`;
  }

  if (preset === "This month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "This year") {
    const s = new Date(now.getFullYear(), 0, 1);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Last year") {
    const s = new Date(now.getFullYear() - 1, 0, 1);
    const e = new Date(now.getFullYear() - 1, 11, 31);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(e)}`;
  }

  if (preset === "This week (Sun-Today)") {
    const s = new Date();
    s.setDate(now.getDate() - now.getDay());
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "This week (Mon-Today)") {
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1);
    const s = new Date();
    s.setDate(diff);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(now)}`;
  }

  if (preset === "Last week (Sun-Sat)") {
    const s = new Date();
    s.setDate(now.getDate() - now.getDay() - 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(e)}`;
  }

  if (preset === "Last week (Mon-Sun)") {
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1) - 7;
    const s = new Date();
    s.setDate(diff);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(e)}`;
  }

  if (preset === "Last business week (Mon-Fri)") {
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1) - 7;
    const s = new Date();
    s.setDate(diff);
    const e = new Date(s);
    e.setDate(s.getDate() + 4);
    return `${formatWithOrdinal(s)} – ${formatWithOrdinal(e)}`;
  }

  return `${formatWithOrdinal(now)} – ${formatWithOrdinal(now)}`;
}

const filterCategories = [
  { id: "direction", label: "Direction", searchPlaceholder: "Search direction" },
  { id: "status", label: "Status", searchPlaceholder: "Search status" },
  { id: "duration", label: "Duration", searchPlaceholder: "Search duration" },
  { id: "jobStatus", label: "Job Status", searchPlaceholder: "Search job status" },
  { id: "callFlow", label: "Call Flow", searchPlaceholder: "Search call flow" },
  { id: "adGroup", label: "Ad Group", searchPlaceholder: "Search ad group" },
  { id: "user", label: "User", searchPlaceholder: "Search user" },
];

const categoryOptionsMap = {
  direction: ["Outgoing calls", "Incoming calls"],
  status: [
    "Answered",
    "Missed",
    "Active",
    "Voicemail",
    "Show also blocked calls",
    "Missed - Response needed",
  ],
  duration: [
    "All durations",
    "Under 30 seconds",
    "30 seconds to 2 minutes",
    "2 to 5 minutes",
    "Over 5 minutes",
  ],
  jobStatus: ["Booked", "Completed", "Cancelled", "Unassigned"],
  callFlow: ["Main IVR", "Support Queue", "Forward to Chara...", "Direct Call"],
  adGroup: ["Google Ads", "Facebook", "Organic"],
  user: ["Alex Rivera", "Marvin Farouse", "Des Spence", "Admin"],
};

export default function PixlPhoneContent() {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState("Calls");
  const [selectedPreset, setSelectedPreset] = useState("Today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTableTab, setActiveTableTab] = useState("Time");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callsList, setCallsList] = useState([]);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  // Workiz Filter System State
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [activeFilterPills, setActiveFilterPills] = useState([]);
  const [openPillId, setOpenPillId] = useState(null);
  const [pillSearchMap, setPillSearchMap] = useState({});

  const handleSelectFilterCategory = (cat) => {
    setShowAddFilterDropdown(false);
    setFilterSearchQuery("");
    if (!activeFilterPills.some((p) => p.id === cat.id)) {
      setActiveFilterPills((prev) => [
        ...prev,
        { ...cat, selected: [] },
      ]);
    }
    setOpenPillId(cat.id);
  };

  const handleTogglePillOption = (pillId, option) => {
    setActiveFilterPills((prev) =>
      prev.map((pill) => {
        if (pill.id !== pillId) return pill;
        const allOpts = categoryOptionsMap[pillId] || [];
        if (option === "Select All") {
          const isAllSelected = pill.selected.length === allOpts.length;
          return { ...pill, selected: isAllSelected ? [] : [...allOpts] };
        }
        const exists = pill.selected.includes(option);
        const newSel = exists
          ? pill.selected.filter((o) => o !== option)
          : [...pill.selected, option];
        return { ...pill, selected: newSel };
      })
    );
  };

  const handleRemoveFilterPill = (pillId) => {
    setActiveFilterPills((prev) => prev.filter((p) => p.id !== pillId));
    if (openPillId === pillId) setOpenPillId(null);
  };

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

  const displayCallsList = callsList.length > 0 ? callsList : sampleCallsData;

  const filteredCalls = displayCallsList.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.from.includes(searchQuery) ||
      item.to.includes(searchQuery) ||
      item.answeredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    for (const pill of activeFilterPills) {
      if (!pill.selected || pill.selected.length === 0) continue;

      if (pill.id === "status") {
        if (!pill.selected.includes(item.status)) return false;
      }
      if (pill.id === "callFlow") {
        if (!pill.selected.includes(item.callFlow)) return false;
      }
      if (pill.id === "adGroup") {
        if (!pill.selected.includes(item.adSource)) return false;
      }
      if (pill.id === "user") {
        if (!pill.selected.includes(item.answeredBy)) return false;
      }
    }

    return true;
  });

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

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Left Side: Active Filter Pills, + Add filter button, ✨ AI filters button */}
        <div className="flex items-center flex-wrap gap-2.5">

          {/* Active Filter Pills (Screenshots 2 & 3) */}
          {activeFilterPills.map((pill) => {
            const isOpen = openPillId === pill.id;
            const options = categoryOptionsMap[pill.id] || [];
            const searchVal = pillSearchMap[pill.id] || "";
            const filteredOpts = options.filter((o) =>
              o.toLowerCase().includes(searchVal.toLowerCase())
            );
            const isAllSelected = pill.selected.length === options.length && options.length > 0;

            let pillLabelText = `${pill.label} is (any)`;
            if (pill.selected.length === 1) {
              pillLabelText = `${pill.label} is (${pill.selected[0]})`;
            } else if (pill.selected.length > 1) {
              pillLabelText = `${pill.label} is (${pill.selected.length} selected)`;
            }

            return (
              <div key={pill.id} className="relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50/90 dark:bg-red-950/40 text-[#D31010] dark:text-red-400 border border-red-200/90 dark:border-red-900/60 rounded-xl text-xs font-semibold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenPillId(isOpen ? null : pill.id)}
                    className="flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{pillLabelText}</span>
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#D31010] dark:text-red-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#D31010] dark:text-red-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilterPill(pill.id)}
                    className="p-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/60 text-[#D31010] dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Filter Option Popover Dropdown (Screenshots 2 & 3) */}
                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOpenPillId(null)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-40 text-xs space-y-2.5">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder={pill.searchPlaceholder || `Search ${pill.label.toLowerCase()}`}
                          value={searchVal}
                          onChange={(e) =>
                            setPillSearchMap({ ...pillSearchMap, [pill.id]: e.target.value })
                          }
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#D31010] font-medium"
                        />
                      </div>

                      {/* Options Checkboxes */}
                      <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
                        <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={() => handleTogglePillOption(pill.id, "Select All")}
                            className="w-4 h-4 rounded border-slate-300 text-[#D31010] focus:ring-[#D31010] accent-[#D31010]"
                          />
                          <span>Select All</span>
                        </label>

                        {filteredOpts.map((opt) => {
                          const isChecked = pill.selected.includes(opt);
                          return (
                            <label
                              key={opt}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer font-medium text-slate-700 dark:text-slate-300"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePillOption(pill.id, opt)}
                                className="w-4 h-4 rounded border-slate-300 text-[#D31010] focus:ring-[#D31010] accent-[#D31010]"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Apply Button (RED) */}
                      <button
                        type="button"
                        onClick={() => setOpenPillId(null)}
                        className="w-full py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                      >
                        Apply
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* + Add filter Button (Screenshot 1) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddFilterDropdown(!showAddFilterDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#0E1E31]/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add filter</span>
            </button>

            {/* Filter Categories Popover Dropdown (Screenshot 1) */}
            {showAddFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowAddFilterDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-40 text-xs space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search filters"
                      value={filterSearchQuery}
                      onChange={(e) => setFilterSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                    {filterCategories
                      .filter((c) =>
                        c.label.toLowerCase().includes(filterSearchQuery.toLowerCase())
                      )
                      .map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectFilterCategory(cat)}
                          className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl font-medium transition-colors cursor-pointer"
                        >
                          {cat.label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ✨ AI filters Button (Screenshots 1, 2, 3) */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-full text-xs font-semibold hover:bg-purple-100/80 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI filters</span>
          </button>
        </div>

        {/* Right Side: Date Range Selector Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#0E1E31]/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span className="text-slate-900 dark:text-white font-extrabold">{selectedPreset}</span>
            <span className="text-slate-400 font-normal">{getDateSubtext(selectedPreset, customStart, customEnd)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showDateDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowDateDropdown(false)} />
              <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-30 text-xs overflow-hidden max-h-96 flex flex-col">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="font-extrabold text-slate-900 dark:text-white text-xs">{selectedPreset}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {getDateSubtext(selectedPreset, customStart, customEnd)}
                  </div>
                </div>

                <div className="overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {workizDateOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        if (opt === "Custom") {
                          setShowDateDropdown(false);
                          setShowCustomModal(true);
                        } else {
                          setSelectedPreset(opt);
                          setShowDateDropdown(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 font-medium transition-colors cursor-pointer ${
                        selectedPreset === opt
                          ? "bg-slate-100 dark:bg-slate-800 text-[#D31010] font-bold"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
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

      {/* Custom Date Range Picker Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Select Custom Date Range
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#D31010]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#D31010]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreset("Custom");
                    setShowCustomModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D31010] hover:bg-[#b00d0d] shadow-sm transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
