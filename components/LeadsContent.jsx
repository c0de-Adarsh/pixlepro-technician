import React, { useState, useEffect, useMemo, useRef } from "react";
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
  X,
  Users,
  Layers,
  Globe,
  Navigation,
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
  const [filterSearchText, setFilterSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // { category: 'team' | 'tag' | 'type' | 'source' | 'area', value: string, label: string }

  const [dateRangeText, setDateRangeText] = useState("Recent 30 days");
  const [leadStatuses, setLeadStatuses] = useState([]);

  // 100% Dynamic Filter Data from Database
  const [teamsList, setTeamsList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [leadTypesList, setLeadTypesList] = useState([]);
  const [sourcesList, setSourcesList] = useState([]);
  const [serviceAreasList, setServiceAreasList] = useState([]);

  const filterDropdownRef = useRef(null);

  useEffect(() => {
    fetchLeads();
    fetchLeadStatuses();
    fetchFilterMetadata();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await Api("GET", "api/events?is_lead=true", null, router);
      if (res) {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = raw.map((item) => {
          const shortId = item._id ? item._id.substring(item._id.length - 4) : item.id;
          const addr = item.address;
          const fullAddr =
            typeof addr === "object"
              ? `${addr.street || ""} ${addr.city || ""}`.trim()
              : item.address || "";

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
            assignedTech: item.assigned_tech || "",
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

  const fetchLeadStatuses = async () => {
    try {
      const res = await Api("GET", "api/lead-statuses", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setLeadStatuses(list);
      } else {
        setLeadStatuses([
          { name: "New", color: "#3B82F6" },
          { name: "Scheduled", color: "#8B5CF6" },
          { name: "In Progress", color: "#F59E0B" },
          { name: "Estimated", color: "#10B981" },
          { name: "Approved", color: "#065F46" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching lead statuses:", err);
    }
  };

  const fetchFilterMetadata = async () => {
    try {
      const [resTeams, resTags, resJobTypes, resSources, resAreas] = await Promise.allSettled([
        Api("GET", "api/teams", null, router),
        Api("GET", "api/tags", null, router),
        Api("GET", "api/job-types", null, router),
        Api("GET", "api/ad-groups", null, router),
        Api("GET", "api/service-areas", null, router),
      ]);

      // 1. Teams (Purely from DB)
      const rawTeams = resTeams.status === "fulfilled" && Array.isArray(resTeams.value?.data) ? resTeams.value.data : [];
      const dbTeams = rawTeams
        .map((t) => ({
          name: t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim(),
          color: t.schedule_color || "#D31010",
        }))
        .filter((t) => t.name);
      setTeamsList(dbTeams);

      // 2. Tags (Purely from DB with their dynamic colors)
      const rawTags = resTags.status === "fulfilled" && Array.isArray(resTags.value?.data) ? resTags.value.data : [];
      const dbTags = rawTags
        .map((t) => ({
          name: t.name,
          color: t.color || "#4C1D95",
        }))
        .filter((t) => t.name);
      setTagsList(dbTags);

      // 3. Lead Types / Job Types (Purely from DB + created leads)
      const rawJobTypes = resJobTypes.status === "fulfilled" && Array.isArray(resJobTypes.value?.data) ? resJobTypes.value.data : [];
      const dbJobTypes = rawJobTypes
        .map((j) => ({
          name: j.name,
          color: j.color || null,
        }))
        .filter((j) => j.name);

      setLeadTypesList(dbJobTypes);

      // 4. Sources / Ad Groups (Purely from DB)
      const rawSources = resSources.status === "fulfilled" && Array.isArray(resSources.value?.data) ? resSources.value.data : [];
      const dbSources = rawSources
        .map((s) => ({
          name: s.name,
          color: s.color || null,
        }))
        .filter((s) => s.name);
      setSourcesList(dbSources);

      // 5. Service Areas (Purely from DB with their dynamic colors)
      const rawAreas = resAreas.status === "fulfilled" && Array.isArray(resAreas.value?.data) ? resAreas.value.data : [];
      const dbAreas = rawAreas
        .map((a) => ({
          name: a.name,
          color: a.color || "#00FFC2",
        }))
        .filter((a) => a.name);
      setServiceAreasList(dbAreas);
    } catch (e) {
      console.error("Error fetching filter metadata:", e);
    }
  };

  // Dynamically sync unique job types from created leads into filter list
  useEffect(() => {
    if (leads && leads.length > 0) {
      setLeadTypesList((prev) => {
        const existingNames = new Set(prev.map((jt) => jt.name.toLowerCase()));
        const fromLeads = [];
        leads.forEach((l) => {
          if (l.type && !existingNames.has(l.type.toLowerCase())) {
            existingNames.add(l.type.toLowerCase());
            fromLeads.push({ name: l.type, color: null });
          }
        });
        return [...prev, ...fromLeads];
      });

      setSourcesList((prev) => {
        const existingNames = new Set(prev.map((s) => s.name.toLowerCase()));
        const fromLeads = [];
        leads.forEach((l) => {
          if (l.source && !existingNames.has(l.source.toLowerCase())) {
            existingNames.add(l.source.toLowerCase());
            fromLeads.push({ name: l.source, color: null });
          }
        });
        return [...prev, ...fromLeads];
      });
    }
  }, [leads]);

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
      // 1. Status Filter from Top Cards
      if (
        selectedFilterCategory !== "all" &&
        item.status.toLowerCase() !== selectedFilterCategory.toLowerCase()
      ) {
        return false;
      }

      // 2. Active 5-Column Filter
      if (activeFilter) {
        const val = activeFilter.value.toLowerCase();
        if (activeFilter.category === "team") {
          const tech = (item.assignedTech || "").toLowerCase();
          const clientName = (item.client.name || "").toLowerCase();
          if (!tech.includes(val) && !clientName.includes(val)) return false;
        } else if (activeFilter.category === "tag") {
          const itemTags = (item.tags || []).map((t) => (typeof t === "string" ? t : t.name || "").toLowerCase());
          if (!itemTags.some((t) => t.includes(val))) return false;
        } else if (activeFilter.category === "type") {
          const itemType = (item.type || "").toLowerCase();
          if (!itemType.includes(val)) return false;
        } else if (activeFilter.category === "source") {
          const itemSource = (item.source || "").toLowerCase();
          if (!itemSource.includes(val)) return false;
        } else if (activeFilter.category === "area") {
          const itemLoc = (item.location || "").toLowerCase();
          if (!itemLoc.includes(val)) return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const idMatch = String(item.id).includes(q);
        const nameMatch = item.client.name.toLowerCase().includes(q);
        const emailMatch = item.client.email.toLowerCase().includes(q);
        const phoneMatch = item.phone.includes(q);
        const typeMatch = item.type.toLowerCase().includes(q);
        const sourceMatch = item.source.toLowerCase().includes(q);
        const locationMatch = item.location.toLowerCase().includes(q);
        return idMatch || nameMatch || emailMatch || phoneMatch || typeMatch || sourceMatch || locationMatch;
      }

      return true;
    });
  }, [leads, selectedFilterCategory, activeFilter, searchQuery]);

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

  const filterQueryLower = filterSearchText.toLowerCase().trim();
  const filteredTeams = teamsList.filter((t) => !filterQueryLower || t.name.toLowerCase().includes(filterQueryLower));
  const filteredTags = tagsList.filter((t) => !filterQueryLower || t.name.toLowerCase().includes(filterQueryLower));
  const filteredTypes = leadTypesList.filter((t) => !filterQueryLower || t.name.toLowerCase().includes(filterQueryLower));
  const filteredSources = sourcesList.filter((s) => !filterQueryLower || s.name.toLowerCase().includes(filterQueryLower));
  const filteredAreas = serviceAreasList.filter((a) => !filterQueryLower || a.name.toLowerCase().includes(filterQueryLower));

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-5 pt-6 sm:pt-8 pb-16 px-3 sm:px-6 md:px-8 text-slate-800 dark:text-slate-100">
      {/* Top Header */}
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

      {/* Top Status Cards */}
      <div className="w-full overflow-x-auto scrollbar-none py-1">
        <div className="flex items-stretch gap-4 min-w-[700px]">
          {metrics.map((metric) => {
            const isSelected = selectedFilterCategory.toLowerCase() === metric.id.toLowerCase();
            return (
              <div
                key={metric.id}
                onClick={() => setSelectedFilterCategory(metric.id)}
                className={`flex-1 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden bg-white dark:bg-[#0E1E31] ${
                  isSelected
                    ? "border-[#D31010] shadow-md ring-2 ring-[#D31010]/15"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#D31010]" />
                )}
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <span
                    className={`text-xs font-bold capitalize ${
                      isSelected
                        ? "text-[#D31010]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {metric.label}
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">
                    {metric.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Width 5-Column Workiz Filter Bar */}
      <div className="relative" ref={filterDropdownRef}>
        <div
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className={`w-full bg-white dark:bg-[#0E1E31] border rounded-2xl px-4 py-3 shadow-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
            showFilterDropdown
              ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
              : activeFilter
              ? "border-[#D31010] ring-1 ring-[#D31010]/20"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            {activeFilter ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 capitalize">
                  {activeFilter.category}:
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-[#D31010] text-xs font-extrabold rounded-full shadow-xs">
                  <span>{activeFilter.label}</span>
                  <X
                    className="w-3.5 h-3.5 hover:text-red-800 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFilter(null);
                    }}
                  />
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400">
                Filter results
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilter && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilter(null);
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-[#D31010] px-2 py-0.5 rounded transition-colors"
              >
                Clear
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                showFilterDropdown ? "rotate-180 text-amber-500" : ""
              }`}
            />
          </div>
        </div>

        {/* 5-Column Dropdown Popup Panel */}
        <AnimatePresence>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.99 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-40 p-6 overflow-hidden text-xs"
            >
              {/* Quick Search inside Dropdown */}
              <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filterSearchText}
                  onChange={(e) => setFilterSearchText(e.target.value)}
                  placeholder="Type to search team, tags, lead types, sources, or service areas..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  autoFocus
                />
                {filterSearchText && (
                  <button
                    type="button"
                    onClick={() => setFilterSearchText("")}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 5 Columns Grid (100% Dynamic from Backend APIs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-h-[420px] overflow-y-auto pr-1">
                {/* 1. TEAM */}
                <div className="space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TEAM
                  </div>
                  <div className="space-y-1">
                    {filteredTeams.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No team members found</div>
                    ) : (
                      filteredTeams.map((team) => {
                        const isSelected = activeFilter?.category === "team" && activeFilter?.value === team.name;
                        return (
                          <button
                            key={team.name}
                            type="button"
                            onClick={() => {
                              setActiveFilter({ category: "team", value: team.name, label: team.name });
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                              isSelected
                                ? "bg-red-50 dark:bg-red-950/40 text-[#D31010] font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            {team.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. TAGS (Dynamic colors from DB) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TAGS
                  </div>
                  <div className="space-y-1.5 flex flex-col items-start">
                    {filteredTags.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No tags found</div>
                    ) : (
                      filteredTags.map((tag) => {
                        const isSelected = activeFilter?.category === "tag" && activeFilter?.value === tag.name;
                        return (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => {
                              setActiveFilter({ category: "tag", value: tag.name, label: tag.name });
                              setShowFilterDropdown(false);
                            }}
                            style={{ backgroundColor: tag.color }}
                            className={`px-3 py-1 text-white text-[11px] font-bold rounded-md shadow-xs hover:opacity-90 transition-opacity cursor-pointer ${
                              isSelected ? "ring-2 ring-offset-2 ring-[#D31010]" : ""
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. LEAD TYPE */}
                <div className="space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    LEAD TYPE
                  </div>
                  <div className="space-y-1">
                    {filteredTypes.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No lead types found</div>
                    ) : (
                      filteredTypes.map((type) => {
                        const isSelected = activeFilter?.category === "type" && activeFilter?.value === type.name;
                        return (
                          <button
                            key={type.name}
                            type="button"
                            onClick={() => {
                              setActiveFilter({ category: "type", value: type.name, label: type.name });
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-red-50 dark:bg-red-950/40 text-[#D31010] font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            {type.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 4. SOURCE */}
                <div className="space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SOURCE
                  </div>
                  <div className="space-y-1">
                    {filteredSources.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No sources found</div>
                    ) : (
                      filteredSources.map((source) => {
                        const isSelected = activeFilter?.category === "source" && activeFilter?.value === source.name;
                        return (
                          <button
                            key={source.name}
                            type="button"
                            onClick={() => {
                              setActiveFilter({ category: "source", value: source.name, label: source.name });
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-red-50 dark:bg-red-950/40 text-[#D31010] font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            {source.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 5. SERVICE AREAS (Dynamic colors from DB) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    SERVICE AREAS
                  </div>
                  <div className="space-y-1.5 flex flex-col items-start">
                    {filteredAreas.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No service areas found</div>
                    ) : (
                      filteredAreas.map((area) => {
                        const isSelected = activeFilter?.category === "area" && activeFilter?.value === area.name;
                        return (
                          <button
                            key={area.name}
                            type="button"
                            onClick={() => {
                              setActiveFilter({ category: "area", value: area.name, label: area.name });
                              setShowFilterDropdown(false);
                            }}
                            style={{ backgroundColor: area.color || "#00FFC2" }}
                            className={`px-3 py-1 text-slate-900 font-bold text-[11px] rounded-md shadow-xs hover:opacity-90 transition-opacity cursor-pointer ${
                              isSelected ? "ring-2 ring-offset-2 ring-[#D31010]" : ""
                            }`}
                          >
                            {area.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filter Top Bar */}
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
                fetchFilterMetadata();
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

        {/* Table */}
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
                    No leads found matching current filter. Click &quot;Add new&quot; to create one.
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
                      onClick={() => router.push(`/leads/${targetId}`)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isChecked ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
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

                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(targetId, e.target.value)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer outline-hidden capitalize bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
                        >
                          {leadStatuses.map((ls) => (
                            <option key={ls._id || ls.name} value={ls.name}>
                              {ls.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white hover:text-[#D31010] transition-colors">
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

                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
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

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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

        {/* Pagination */}
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
