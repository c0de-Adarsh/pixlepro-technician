import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Upload, RefreshCw, ChevronDown, Check, Loader2, FileText, Trash2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddEventDrawer({
  isOpen,
  onClose,
  onEventSaved,
  eventToEdit = null,
  initialDate = "2026-08-20",
  initialTime = "13:00",
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamMember, setTeamMember] = useState("");
  const [teamOptions, setTeamOptions] = useState([]);
  const [status, setStatus] = useState("Open");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [startDate, setStartDate] = useState(initialDate || "2026-08-20");
  const [startTime, setStartTime] = useState(initialTime || "13:00");
  const [endDate, setEndDate] = useState(initialDate || "2026-08-20");
  const [endTime, setEndTime] = useState("14:00");
  const [isAllDay, setIsAllDay] = useState(false);

  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("Daily");
  const [endOption, setEndOption] = useState("occurrences");
  const [occurrences, setOccurrences] = useState(7);
  const [untilDate, setUntilDate] = useState("2026-09-20");

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDescription(eventToEdit.description || eventToEdit.notes || "");
      setTeamMember(eventToEdit.tech || (Array.isArray(eventToEdit.team_members) ? eventToEdit.team_members[0] : "") || "");
      setStatus(eventToEdit.status || "Open");
      if (eventToEdit.startDate) setStartDate(eventToEdit.startDate);
      if (eventToEdit.startTime) setStartTime(eventToEdit.startTime);
      if (eventToEdit.endDate) setEndDate(eventToEdit.endDate);
      if (eventToEdit.endTime) setEndTime(eventToEdit.endTime);
      if (eventToEdit.isAllDay !== undefined) setIsAllDay(eventToEdit.isAllDay);
    } else if (isOpen) {
      setTitle("");
      setDescription("");
      setTeamMember("");
      setStatus("Open");
      const d = initialDate || "2026-08-20";
      const t = initialTime || "13:00";
      setStartDate(d);
      setEndDate(d);
      setStartTime(t);

      let endH = "14:00";
      if (t && t.includes(":")) {
        const [h, m] = t.split(":");
        const nextH = (parseInt(h, 10) + 1) % 24;
        endH = `${String(nextH).padStart(2, "0")}:${m || "00"}`;
      }
      setEndTime(endH);
      setIsAllDay(false);
    }
  }, [eventToEdit, isOpen, initialDate, initialTime]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await Api("GET", "api/teams", null, router);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (data.length > 0) {
          const list = data.map((t) => ({
            id: t._id || t.id,
            name: t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim() || t.email,
            role: t.role || "tech",
          }));
          setTeamOptions(list);
        }
      } catch (err) {
      }
    };
    fetchTeamMembers();
  }, [router]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) attached!`);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Event title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        is_event: true,
        team_members: teamMember ? [teamMember] : [],
        team_member_names: teamMember ? [teamMember] : [],
        assigned_tech: teamMember || "",
        assigned_techs: teamMember ? [teamMember] : [],
        status,
        schedule: {
          start_date: startDate,
          start_time: startTime,
          end_date: endDate,
          end_time: endTime,
          is_all_day: isAllDay,
          is_recurring: recurringFrequency !== "Never",
          recurring: {
            frequency: recurringFrequency,
            end_option: endOption,
            occurrences,
            until_date: untilDate,
          },
        },
      };

      const isEdit = Boolean(eventToEdit?._id || eventToEdit?.id);
      const url = isEdit ? `api/events/${eventToEdit._id || eventToEdit.id}` : "api/events";
      const method = isEdit ? "PUT" : "POST";

      const res = await Api(method, url, payload, router);
      if (res && (res.success || res._id || res.data)) {
        toast.success(isEdit ? "Event updated successfully!" : "Event created successfully!");
        if (onEventSaved) {
          onEventSaved(res.data || res);
        }
        onClose();
      } else {
        toast.error(res?.message || "Failed to save event");
      }
    } catch (err) {
      toast.error("Error saving event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRecurring = () => {
    setShowRecurringModal(false);
    toast.success(`Recurring schedule set to ${recurringFrequency}!`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Right Sliding Panel Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col z-10 text-slate-800 dark:text-slate-100"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {eventToEdit ? "Edit event" : "Add event"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Form - Scrollable */}
              <form onSubmit={handleSubmitEvent} className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Details Section */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Details
                  </span>

                  <div>
                    <input
                      type="text"
                      placeholder="Title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010] resize-none"
                    />
                  </div>
                </div>

                {/* Team members */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Team members
                  </label>
                  <div className="relative">
                    <select
                      value={teamMember}
                      onChange={(e) => setTeamMember(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <option value="">Assign team members</option>
                      {teamOptions.length > 0 ? (
                        teamOptions.map((t) => (
                          <option key={t.id || t.name} value={t.name}>
                            {t.name} ({t.role})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="PIXL TECHNICIAN">PIXL TECHNICIAN</option>
                          <option value="charanpal jaggi">charanpal jaggi</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Schedule
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRecurringModal(true)}
                      className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Set recurring event</span>
                    </button>
                  </div>

                  {/* Starts Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Starts
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        At
                      </span>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Ends Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Ends
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        At
                      </span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* All-day event Checkbox */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] border-slate-300 dark:border-slate-700"
                    />
                    <span>All-day event</span>
                  </label>
                </div>

                {/* Attachments Dropzone */}
                <div className="space-y-2 pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Attachments
                  </span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-blue-200 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-blue-500" />
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Upload files here
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Max 24MB of PDF, JPEG, or PNG files can be uploaded
                    </p>
                  </div>

                  {/* Selected Files Badges */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#D31010] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#b00d0d] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{eventToEdit ? "Saving..." : "Adding..."}</span>
                      </>
                    ) : (
                      <span>{eventToEdit ? "Save changes" : "Add event"}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sub-modal: Recurring Schedule Modal (Screenshot 5) */}
      <AnimatePresence>
        {showRecurringModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecurringModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 text-slate-800 dark:text-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Recurring schedule
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create an event that repeats on your schedule
                  </p>
                </div>
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Schedule Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  Schedule
                </label>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              {/* Event ends options */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  Event ends
                </span>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="endOpt"
                      checked={endOption === "occurrences"}
                      onChange={() => setEndOption("occurrences")}
                      className="w-4 h-4 text-[#D31010] focus:ring-[#D31010]"
                    />
                    <span>After</span>
                  </label>
                  <input
                    type="number"
                    value={occurrences}
                    onChange={(e) => setOccurrences(Number(e.target.value))}
                    className="w-16 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-center focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold">occurrences</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="endOpt"
                      checked={endOption === "untilDate"}
                      onChange={() => setEndOption("untilDate")}
                      className="w-4 h-4 text-[#D31010] focus:ring-[#D31010]"
                    />
                    <span>On</span>
                  </label>
                  <input
                    type="date"
                    value={untilDate}
                    onChange={(e) => setUntilDate(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Summary details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                <p>
                  <strong>Total events:</strong> {occurrences} events
                </p>
                <p>
                  <strong>Last event:</strong> August 27th 2026
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecurringModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecurring}
                  className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
