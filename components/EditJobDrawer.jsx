import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Edit2,
  Phone,
  MessageSquare,
  MoreVertical,
  Calendar,
  Clock,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

const PARENT_STATUS_CONFIG = [
  { name: "Submitted", color: "#3B82F6" },
  { name: "In Progress", color: "#A855F7" },
  { name: "Canceled", color: "#EF4444" },
  { name: "Done", color: "#10B981" },
  { name: "Pending", color: "#F59E0B" },
  { name: "Done Pending Approval", color: "#3B82F6" },
];

export default function EditJobDrawer({ isOpen, onClose, job, onJobUpdated }) {
  const router = useRouter();

  const [activeDrawerTab, setActiveDrawerTab] = useState("details");
  const [drawerLineItems, setDrawerLineItems] = useState([]);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  const [selectedTag, setSelectedTag] = useState("UR-CHANNEL");
  const [status, setStatus] = useState("Done Pending Approval");
  const [subStatus, setSubStatus] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const [availableSubStatuses, setAvailableSubStatuses] = useState([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("07:45 AM");
  const [endDate, setEndDate] = useState("2026-08-20");
  const [endTime, setEndTime] = useState("07:50 AM");
  const [isAllDay, setIsAllDay] = useState(false);

  const [assignedTechs, setAssignedTechs] = useState([]);
  const [techToAssign, setTechToAssign] = useState("");
  const [availableTechs, setAvailableTechs] = useState([]);

  const [jobTotal, setJobTotal] = useState("168.00");
  const [totalDue, setTotalDue] = useState("168.00");

  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState("po 00562");
  const [newNoteText, setNewNoteText] = useState("");
  const [notesList, setNotesList] = useState([
    {
      author: "Reverence",
      time: "9 months ago",
      text: "po 00562",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubStatuses = async () => {
      try {
        const res = await Api("GET", "api/sub-statuses", null, router);
        const data = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(data)) {
          setAvailableSubStatuses(data);
        }
      } catch (e) {
        console.error("SubStatus fetch error:", e);
      }
    };
    fetchSubStatuses();
  }, [router]);

  useEffect(() => {
    if (job) {
      setTitle(job.title || `Job #${job.jobId || "426"}`);
      setClientName(job.clientName || "UR CHANNEL UR-OPP-01098");
      setCompanyName(job.companyName || "UR-OPP-01110");
      setPhone(job.phone || "(855) 487-7469");
      setAddress(job.address || "295 Regional Road 77 Unit F1\nSt. Catharines, Ontario L2R 6P9");
      setJobType(job.jobType || "Service Call");
      setServiceArea(job.serviceArea || "Halifax");
      setSelectedTag(job.tag || "UR-CHANNEL");
      setStatus(job.status || "Done Pending Approval");

      const isUnsch = job.isUnscheduled || job.is_scheduled === false || String(job.status).toLowerCase() === "unscheduled" || !job.startDate;
      setIsScheduled(!isUnsch);

      if (job.startDate) {
        setStartDate(job.startDate);
      }
      if (job.startTime) {
        setStartTime(job.startTime);
      }
      if (job.endDate) {
        setEndDate(job.endDate);
      }
      if (job.endTime) {
        setEndTime(job.endTime);
      }
      if (job.isAllDay !== undefined) {
        setIsAllDay(job.isAllDay);
      }

      if (Array.isArray(job.assignedTechs) && job.assignedTechs.length > 0) {
        setAssignedTechs(job.assignedTechs);
      } else if (job.tech) {
        setAssignedTechs([job.tech]);
      } else {
        setAssignedTechs(["Gbenga"]);
      }

      setJobTotal(job.total_amount ? Number(job.total_amount).toFixed(2) : "168.00");
      setTotalDue(job.balance_due ? Number(job.balance_due).toFixed(2) : "168.00");
      
      const rawNotes = job.description || job.notes || "po 00562";
      setNotes(rawNotes);
      setNotesList([
        {
          author: "Reverence",
          time: "9 months ago",
          text: rawNotes,
        },
      ]);

      if (Array.isArray(job.line_items) && job.line_items.length > 0) {
        setDrawerLineItems(job.line_items);
      } else if (Array.isArray(job.items) && job.items.length > 0) {
        setDrawerLineItems(job.items);
      } else {
        setDrawerLineItems([]);
      }
    }
  }, [job]);

  useEffect(() => {
    if (isOpen && (job?._id || job?.id)) {
      const fetchJobDetails = async () => {
        try {
          const res = await Api("GET", `api/events/${job._id || job.id}`, null, router);
          const data = res?.data || res || {};
          if (data) {
            const raw = Array.isArray(data.line_items) && data.line_items.length > 0
              ? data.line_items
              : (Array.isArray(data.items) ? data.items : []);
            setDrawerLineItems(raw);
            if (data.total_amount !== undefined) {
              setJobTotal(Number(data.total_amount).toFixed(2));
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchJobDetails();
    }
  }, [isOpen, job, router]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await Api("GET", "api/teams", null, router);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const names = data.map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean);
        setAvailableTechs(names);
      } catch (err) {
        setAvailableTechs([]);
      }
    };
    fetchTeam();
  }, [router]);

  const handleAddTech = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (!assignedTechs.includes(val)) {
      setAssignedTechs((prev) => [...prev, val]);
      toast.success(`Assigned ${val}`);
    }
    setTechToAssign("");
  };

  const handleRemoveTech = (techName) => {
    setAssignedTechs((prev) => prev.filter((t) => t !== techName));
  };

  const handleSave = async () => {
    if (!job?.id && !job?._id) {
      toast.error("Job ID not found");
      return;
    }
    setIsSubmitting(true);
    const targetId = job._id || job.id;
    try {
      const payload = {
        title,
        client_name: clientName,
        company_name: companyName,
        phone,
        status,
        sub_status: subStatus,
        status_color: getCurrentStatusColor(status),
        job_type: jobType,
        service_area: serviceArea,
        tag: selectedTag,
        is_scheduled: isScheduled,
        schedule_status: isScheduled ? "scheduled" : "unscheduled",
        assigned_tech: assignedTechs[0] || "",
        assigned_techs: assignedTechs,
        team_member_names: assignedTechs,
        description: notes,
        schedule: isScheduled
          ? {
              start_date: startDate,
              start_time: startTime,
              end_date: endDate,
              end_time: endTime,
              is_all_day: isAllDay,
            }
          : {
              start_date: null,
              start_time: null,
              end_date: null,
              end_time: null,
              is_all_day: false,
            },
      };

      const res = await Api("PUT", `api/events/${targetId}`, payload, router);
      if (res && (res.success || res.data || res._id)) {
        toast.success("Job updated successfully!");
        try {
          if (onJobUpdated) {
            onJobUpdated({ ...job, ...payload, id: targetId, _id: targetId });
          }
        } catch (cbErr) {
          console.error("onJobUpdated callback error:", cbErr);
        }
        onClose();
      } else {
        toast.error(res?.message || "Failed to update job");
      }
    } catch (err) {
      toast.error("Error saving job changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStatusColor = (st = status) => {
    if (statusColor && st === status) return statusColor;
    const foundSub = availableSubStatuses.find(
      (s) => (s.name || "").toLowerCase() === String(st).toLowerCase()
    );
    if (foundSub && foundSub.color) return foundSub.color;
    const foundParent = PARENT_STATUS_CONFIG.find(
      (p) => (p.name || "").toLowerCase() === String(st).toLowerCase()
    );
    if (foundParent) return foundParent.color;
    return "#3B82F6";
  };

  const getStatusDotColor = (st) => {
    return getCurrentStatusColor(st);
  };

  const timesList = [
    "12:00 AM", "12:15 AM", "12:30 AM", "12:45 AM",
    "01:00 AM", "01:15 AM", "01:30 AM", "01:45 AM",
    "02:00 AM", "02:15 AM", "02:30 AM", "02:45 AM",
    "03:00 AM", "03:15 AM", "03:30 AM", "03:45 AM",
    "04:00 AM", "04:15 AM", "04:30 AM", "04:45 AM",
    "05:00 AM", "05:15 AM", "05:30 AM", "05:45 AM",
    "06:00 AM", "06:15 AM", "06:30 AM", "06:45 AM",
    "07:00 AM", "07:15 AM", "07:30 AM", "07:45 AM", "07:50 AM",
    "08:00 AM", "08:15 AM", "08:30 AM", "08:45 AM",
    "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM",
    "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
    "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
    "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "01:00 PM", "01:15 PM", "01:30 PM", "01:45 PM",
    "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM",
    "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM",
    "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM",
    "05:00 PM", "05:15 PM", "05:30 PM", "05:45 PM",
    "06:00 PM", "06:15 PM", "06:30 PM", "06:45 PM",
    "07:00 PM", "07:15 PM", "07:30 PM", "07:45 PM",
    "08:00 PM", "08:15 PM", "08:30 PM", "08:45 PM",
    "09:00 PM", "09:15 PM", "09:30 PM", "09:45 PM",
    "10:00 PM", "10:15 PM", "10:30 PM", "10:45 PM",
    "11:00 PM", "11:15 PM", "11:30 PM", "11:45 PM",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                  Job ID: {job?.jobId || "1065"}
                </span>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                    autoFocus
                    className="text-xs font-bold px-2 py-0.5 border border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate cursor-pointer hover:underline"
                  >
                    {title}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="p-1 text-slate-400 hover:text-[#D31010] cursor-pointer flex-shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(`/jobs/${job?.id || job?._id || "1065"}`)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                  title="Open full page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content (Matching Screenshots 2 & 3) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-semibold">
                {/* CLIENT */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    CLIENT
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {clientName}
                      </div>
                      {companyName && (
                        <div className="text-slate-500 font-bold text-xs mt-0.5">
                          {companyName}
                        </div>
                      )}
                      {phone && (
                        <div className="text-[#4B9EFF] font-bold text-xs mt-0.5">
                          {phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push("/messages")}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    ADDRESS
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-slate-700 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-line hover:text-[#D31010] dark:hover:text-[#D31010] transition-colors"
                  >
                    {address || "295 Regional Road 77 Unit F1\nSt. Catharines, Ontario L2R 6P9"}
                  </a>
                </div>

                {/* JOB TYPE */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    JOB TYPE
                  </span>
                  <div className="text-slate-900 dark:text-white font-extrabold text-xs">
                    {jobType || "Service Call"}
                  </div>
                </div>

                {/* Add tasks to this job Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${job?.id || job?._id || "1065"}?tab=tasks`)}
                    className="w-full py-2.5 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#4B9EFF] border border-blue-100 dark:border-blue-900/40 text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add tasks to this job</span>
                  </button>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                    Tags
                  </label>
                  {selectedTag ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-amber-400 text-slate-900 font-extrabold text-xs rounded-xl inline-flex items-center gap-2 shadow-xs">
                        <span>{selectedTag}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTag("")}
                          className="hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                      >
                        <option value="">Assign Tags</option>
                        <option value="UR-CHANNEL">UR-CHANNEL</option>
                        <option value="Urgent">Urgent</option>
                        <option value="VIP Client">VIP Client</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Residential">Residential</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Status & Sub-Status Selector (Screenshot 1 Match) */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                    Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="w-full flex items-center justify-between pl-3.5 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getCurrentStatusColor(status) }}
                        />
                        <span className="truncate">{status}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isStatusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isStatusDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsStatusDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.98 }}
                            className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1.5 max-h-64 overflow-y-auto"
                          >
                            {PARENT_STATUS_CONFIG.map((parent) => {
                              const matchingSubs = availableSubStatuses.filter(
                                (s) =>
                                  (s.parent_status || "").toLowerCase().trim() ===
                                  parent.name.toLowerCase().trim()
                              );

                              return (
                                <div key={parent.name} className="py-0.5">
                                  {/* Parent Status Item */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStatus(parent.name);
                                      setSubStatus("");
                                      setStatusColor(parent.color);
                                      setIsStatusDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                                      status === parent.name && !subStatus
                                        ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: parent.color }}
                                    />
                                    <span>{parent.name}</span>
                                  </button>

                                  {/* Nested Sub-Statuses under this Parent */}
                                  {matchingSubs.map((sub) => (
                                    <button
                                      key={sub._id || sub.id || sub.name}
                                      type="button"
                                      onClick={() => {
                                        setStatus(sub.name);
                                        setSubStatus(sub.name);
                                        setStatusColor(sub.color || parent.color);
                                        setIsStatusDropdownOpen(false);
                                      }}
                                      className={`w-full flex items-center gap-2.5 pl-8 pr-4 py-1.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                                        status === sub.name
                                          ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                                      }`}
                                    >
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: sub.color || parent.color }}
                                      />
                                      <span>{sub.name}</span>
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Scheduled / Unscheduled Toggle (Screenshot 2 & 3) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {isScheduled ? "Scheduled" : "Unscheduled"}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {isScheduled ? "This job is scheduled on calendar" : "This job is unscheduled"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(!isScheduled)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        isScheduled ? "bg-slate-800 dark:bg-slate-200" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`bg-white dark:bg-slate-900 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isScheduled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="space-y-3 pt-1 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {/* Starts */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                            Starts
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                            At
                          </label>
                          <div className="relative">
                            <select
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full appearance-none px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {timesList.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Ends */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                            Ends
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                            At
                          </label>
                          <div className="relative">
                            <select
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full appearance-none px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                            >
                              {timesList.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) => setIsAllDay(e.target.checked)}
                            className="w-4 h-4 rounded text-[#D31010] border-slate-300 dark:border-slate-700 focus:ring-[#D31010]"
                          />
                          <span>All-day event</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => toast.success("Schedule updated")}
                          className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Set date
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Section */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                    Team
                  </label>

                  {/* Assigned Tech List */}
                  <div className="space-y-2">
                    {assignedTechs.map((techName) => (
                      <div
                        key={techName}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl"
                      >
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {techName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toast.info(`Notification sent to ${techName}`)}
                            className="p-1 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                            title="Notify Tech"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(techName)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                            title="Remove Tech"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assign Tech Select */}
                  <div className="relative">
                    <select
                      value={techToAssign}
                      onChange={handleAddTech}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                    >
                      <option value="">Assign A Tech</option>
                      {availableTechs.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="text-[11px] text-slate-400">
                    • Showing techs for <span className="font-bold text-slate-600 dark:text-slate-300">{serviceArea || "Halifax"}</span>
                  </div>

                  <div className="pt-2 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Job Total:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">${jobTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Due:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">${totalDue}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>Notes</span>
                    {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showNotes && (
                    <div className="space-y-2.5">
                      {notesList.map((n, i) => (
                        <div
                          key={i}
                          className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Edit2 className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300 font-extrabold">{n.author || "Reverence"}</span>
                              <span>• {n.time || "9 months ago"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toast.info("Note options")}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line">
                            {n.text}
                          </p>
                        </div>
                      ))}

                      <div className="pt-1">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newNoteText.trim()) {
                              setNotesList((prev) => [
                                ...prev,
                                {
                                  author: "Admin",
                                  time: "Just now",
                                  text: newNoteText.trim(),
                                },
                              ]);
                              setNotes((prev) => prev ? `${prev}\n${newNoteText.trim()}` : newNoteText.trim());
                              setNewNoteText("");
                              toast.success("Note added");
                            }
                          }}
                          placeholder="Add a note..."
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

          {/* Footer Save Button */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
