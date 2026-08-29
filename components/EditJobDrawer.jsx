import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Edit2,
  Phone,
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

  const [selectedTag, setSelectedTag] = useState("");
  const [status, setStatus] = useState("Submitted");

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("07:45 AM");
  const [endDate, setEndDate] = useState("2026-08-20");
  const [endTime, setEndTime] = useState("07:50 AM");
  const [isAllDay, setIsAllDay] = useState(false);

  const [assignedTechs, setAssignedTechs] = useState([]);
  const [techToAssign, setTechToAssign] = useState("");
  const [availableTechs, setAvailableTechs] = useState([]);

  const [jobTotal, setJobTotal] = useState("0.00");
  const [totalDue, setTotalDue] = useState("0.00");

  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title || `Job #${job.jobId || "1065"}`);
      setClientName(job.clientName || "Client");
      setCompanyName(job.companyName || "");
      setPhone(job.phone || "");
      setAddress(job.address || "");
      setJobType(job.jobType || "CAPTURE TV");
      setServiceArea(job.serviceArea || "Edmonton");
      setSelectedTag(job.tag || "");
      setStatus(job.status || "Submitted");

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
        setAssignedTechs(["PIXL TECHNICIAN", "charanpal jaggi"]);
      }

      setJobTotal(job.total_amount ? Number(job.total_amount).toFixed(2) : "0.00");
      setTotalDue(job.balance_due ? Number(job.balance_due).toFixed(2) : "0.00");
      setNotes(job.description || job.notes || "");

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
        if (data.length > 0) {
          const names = data.map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean);
          setAvailableTechs(names);
        } else {
          setAvailableTechs(["PIXL TECHNICIAN", "charanpal jaggi", "Adarsh Tech", "Rockstar Tech"]);
        }
      } catch (err) {
        setAvailableTechs(["PIXL TECHNICIAN", "charanpal jaggi", "Adarsh Tech", "Rockstar Tech"]);
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
        job_type: jobType,
        service_area: serviceArea,
        assigned_tech: assignedTechs[0] || "",
        assigned_techs: assignedTechs,
        team_member_names: assignedTechs,
        description: notes,
        schedule: {
          start_date: startDate,
          start_time: startTime,
          end_date: endDate,
          end_time: endTime,
          is_all_day: isAllDay,
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

  const getStatusDotColor = (st) => {
    const s = String(st || "").toLowerCase();
    if (s.includes("submit") || s.includes("open") || s.includes("new")) return "bg-blue-500";
    if (s.includes("progress")) return "bg-amber-500";
    if (s.includes("complete") || s.includes("done")) return "bg-emerald-500";
    if (s.includes("cancel")) return "bg-slate-400";
    return "bg-[#D31010]";
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
            className="relative w-full max-w-[420px] bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
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

            {/* Tabs: Details / Custom fields / Items */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 flex-shrink-0 text-xs font-bold bg-white dark:bg-[#0E1E31]">
              {[
                { id: "details", label: "Details" },
                { id: "custom_fields", label: "Custom fields" },
                { id: "items", label: "Items" },
              ].map((t) => {
                const active = activeDrawerTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveDrawerTab(t.id)}
                    className={`py-3 px-3 transition-all relative cursor-pointer ${
                      active
                        ? "text-slate-900 dark:text-white font-extrabold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>{t.label}</span>
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom fields View */}
            {activeDrawerTab === "custom_fields" && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18M15 9h6M15 15h6" />
                  </svg>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No custom fields</h4>
                <p className="text-xs text-slate-500 max-w-[220px]">Track more information on your jobs relevant to your workflow</p>
                <button
                  type="button"
                  onClick={() => toast.info("Custom fields modal")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Add custom fields
                </button>
              </div>
            )}

            {/* Items View */}
            {activeDrawerTab === "items" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {drawerLineItems.length > 0 ? (
                  <div className="space-y-4">
                    {drawerLineItems.map((it, idx) => (
                      <div key={idx} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {it.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          {it.qty || 1} x ${Number(it.price || 0).toFixed(2)} each
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ${(Number(it.qty || 1) * Number(it.price || 0)).toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            {it.item_type || it.type || "SERVICE"}
                          </span>
                          {it.taxable && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              TAXABLE
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-slate-500 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                      <p>This is view only. To add an item you will be redirected to the job page.</p>
                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${job?.id || job?._id || "1065"}?tab=items`)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer block"
                      >
                        Go to Items page
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No items</h4>
                    <p className="text-xs text-slate-500 max-w-[240px]">You can add items from the job page only.</p>
                    <button
                      type="button"
                      onClick={() => router.push(`/jobs/${job?.id || job?._id || "1065"}?tab=items`)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Add items from the job page
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Content (Details Tab) */}
            {activeDrawerTab === "details" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold">
                {/* STATUS */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    STATUS
                  </span>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(status)}`} />
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full appearance-none pl-8 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="In progress">In progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Done pending approval">Done pending approval</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              {/* CLIENT */}
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                  CLIENT
                </span>
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {clientName} {companyName ? <span className="font-normal text-slate-500">({companyName})</span> : null}
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-full text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      title={phone}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                  ADDRESS
                </span>
                <div className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-line">
                  {address || "lucknow Unit 123 Main Street\nlucknow, New York 226017"}
                </div>
              </div>

              {/* JOB TYPE */}
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                  JOB TYPE
                </span>
                <div className="text-slate-900 dark:text-white font-extrabold">
                  {jobType || "CAPTURE TV"}
                </div>
              </div>

              {/* Add tasks to this job Button */}
              <div>
                <button
                  type="button"
                  onClick={() => toast.info("Task management opened")}
                  className="w-full py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 border border-slate-200/80 dark:border-slate-800 text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
                <div className="relative">
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                  >
                    <option value="">Assign Tags</option>
                    <option value="Urgent">Urgent</option>
                    <option value="VIP Client">VIP Client</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    <span className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(status)}`} />
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none pl-8 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In progress">In progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Done pending approval">Done pending approval</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Scheduled */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Scheduled
                    </span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      isScheduled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isScheduled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isScheduled && (
                  <div className="space-y-3 pt-1">
                    {/* Starts */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                          Starts
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
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
                        <div className="relative">
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
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
                        onClick={() => toast.success("Date updated")}
                        className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                      className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl"
                    >
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {techName}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toast.info(`Message sent to ${techName}`)}
                          className="p-1 text-slate-400 hover:text-[#D31010] cursor-pointer"
                          title="Notify Tech"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(techName)}
                          className="p-1 text-slate-300 hover:text-red-500 cursor-pointer"
                          title="Remove Tech"
                        >
                          <X className="w-3.5 h-3.5" />
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
                  • Showing techs for <span className="font-bold text-slate-600 dark:text-slate-300">{serviceArea}</span>
                </div>

                <div className="pt-2 space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Job Total:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">${jobTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Due:</span>
                    <span className="font-extrabold text-[#D31010]">${totalDue}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>Notes</span>
                  {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showNotes && (
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 resize-none"
                  />
                )}
              </div>
            </div>
          )}

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
