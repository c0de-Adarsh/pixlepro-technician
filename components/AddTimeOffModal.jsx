import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Calendar, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddTimeOffModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  timeOffToEdit,
  onSaved,
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [reason, setReason] = useState("Personal");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("12:00 AM");
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("12:15 AM");
  const [isAllDay, setIsAllDay] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [teamUsers, setTeamUsers] = useState(["PIXL TECHNICIAN"]);

  const reasonOptions = [
    "Personal",
    "Vacation",
    "Sick leave",
    "Holiday",
    "Doctor Appointment",
    "Family",
    "Other",
  ];

  const timeOptions = [
    "12:00 AM", "12:15 AM", "12:30 AM", "12:45 AM",
    "01:00 AM", "01:15 AM", "01:30 AM", "01:45 AM",
    "02:00 AM", "02:15 AM", "02:30 AM", "02:45 AM",
    "03:00 AM", "03:15 AM", "03:30 AM", "03:45 AM",
    "04:00 AM", "04:15 AM", "04:30 AM", "04:45 AM",
    "05:00 AM", "05:15 AM", "05:30 AM", "05:45 AM",
    "06:00 AM", "06:15 AM", "06:30 AM", "06:45 AM",
    "07:00 AM", "07:15 AM", "07:30 AM", "07:45 AM",
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

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await Api("GET", "api/teams");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const names = list.map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean);
        if (names.length > 0) {
          setTeamUsers(Array.from(new Set(["PIXL TECHNICIAN", ...names])));
        }
      } catch (e) {}
    };
    if (isOpen) fetchTeams();

    if (timeOffToEdit) {
      setSelectedUser(timeOffToEdit.user_name || "PIXL TECHNICIAN");
      setReason(timeOffToEdit.reason || "Personal");
      if (timeOffToEdit.start_date) {
        setStartDate(new Date(timeOffToEdit.start_date).toISOString().split("T")[0]);
      }
      setStartTime(timeOffToEdit.start_time || "12:00 AM");
      if (timeOffToEdit.end_date) {
        setEndDate(new Date(timeOffToEdit.end_date).toISOString().split("T")[0]);
      }
      setEndTime(timeOffToEdit.end_time || "12:15 AM");
      setIsAllDay(Boolean(timeOffToEdit.is_all_day));
      setNotes(timeOffToEdit.notes || "");
    } else {
      setSelectedUser("PIXL TECHNICIAN");
      setReason("Personal");
      const d = initialDate || new Date().toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(d);
      setStartTime(initialTime || "12:00 AM");
      setEndTime("12:15 AM");
      setIsAllDay(false);
      setNotes("");
    }
  }, [timeOffToEdit, initialDate, initialTime, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        user_name: selectedUser,
        reason,
        start_date: startDate,
        start_time: startTime,
        end_date: endDate,
        end_time: endTime,
        is_all_day: isAllDay,
        notes: notes.trim(),
      };

      let res;
      if (timeOffToEdit) {
        const id = timeOffToEdit._id || timeOffToEdit.id;
        res = await Api("PUT", `api/time-off/${id}`, payload);
      } else {
        res = await Api("POST", "api/time-off", payload);
      }

      if (res && (res.success || res.data)) {
        toast.success(timeOffToEdit ? "Time off updated" : "Time off added");
        if (onSaved) onSaved();
        onClose();
      } else {
        toast.error(res?.message || "Failed to save time off");
      }
    } catch (err) {
      toast.error("Error saving time off");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-slate-800 dark:text-slate-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {timeOffToEdit ? "Edit time off" : "Add time off"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-1.5 bg-white dark:bg-slate-900 relative focus-within:ring-2 focus-within:ring-[#D31010]/20 focus-within:border-[#D31010]">
                <label className="block text-[10px] font-bold text-slate-400">
                  Select user
                </label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 py-0.5"
                  >
                    {teamUsers.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="border-2 border-[#D31010]/80 rounded-xl px-4 py-1.5 bg-white dark:bg-slate-900 relative focus-within:ring-2 focus-within:ring-[#D31010]/30">
                <label className="block text-[10px] font-bold text-[#D31010]">
                  Reason
                </label>
                <div className="relative">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 py-0.5"
                  >
                    {reasonOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D31010] pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900">
                  <label className="block text-[10px] font-bold text-slate-400">
                    Starts
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 relative">
                  <label className="block text-[10px] font-bold text-slate-400">
                    At
                  </label>
                  <div className="relative">
                    <select
                      value={startTime}
                      disabled={isAllDay}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 disabled:opacity-40"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900">
                  <label className="block text-[10px] font-bold text-slate-400">
                    Ends
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 relative">
                  <label className="block text-[10px] font-bold text-slate-400">
                    At
                  </label>
                  <div className="relative">
                    <select
                      value={endTime}
                      disabled={isAllDay}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 disabled:opacity-40"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="w-4 h-4 text-[#D31010] accent-[#D31010] rounded"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  All-day event
                </span>
              </label>

              <div>
                <textarea
                  rows={3}
                  placeholder="Add a note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{timeOffToEdit ? "Save Changes" : "Add time off"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
