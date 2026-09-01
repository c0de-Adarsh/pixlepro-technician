import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit2, X, AlertTriangle, Loader2 } from "lucide-react";

export default function ViewTimeOffModal({
  isOpen,
  onClose,
  timeOff,
  onEdit,
  onDelete,
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!timeOff) return null;

  const formatDateSchedule = () => {
    if (!timeOff.start_date) return "N/A";
    const d = new Date(timeOff.start_date);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const dateNum = d.getDate();

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const dateStr = `${dayName} ${monthName} ${getOrdinal(dateNum)}`;

    if (timeOff.is_all_day) {
      return `${dateStr} (All day)`;
    }

    return `${dateStr} ${timeOff.start_time || "12:00 AM"} – ${timeOff.end_time || "12:15 AM"}`;
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(timeOff);
      setShowConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-slate-800 dark:text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Time off
                </h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-1.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(timeOff)}
                    className="p-1.5 hover:text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    User
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {timeOff.user_name || "Team Member"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Scheduled
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {formatDateSchedule()}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Reason
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {timeOff.reason || "Personal"}
                  </span>
                </div>

                {timeOff.notes && (
                  <div>
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Note
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {timeOff.notes}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDelete(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-slate-800 dark:text-slate-100 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-[#D31010] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Delete time off
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete this time off for <span className="font-bold text-slate-800 dark:text-slate-200">{timeOff.user_name}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white rounded-full text-xs font-extrabold shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
