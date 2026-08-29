import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Clock, Calendar, Timer } from "lucide-react";

export default function ClockModal({
  isOpen,
  onClose,
  isClockedIn,
  onToggleClock,
  loading,
  currentShift,
}) {
  const [mounted, setMounted] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  const formattedCurrentTime = nowTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedCurrentDate = nowTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getElapsedTime = () => {
    if (!currentShift?.start_time) return "00:00:00";
    const start = new Date(currentShift.start_time).getTime();
    const now = nowTime.getTime();
    const diffSec = Math.max(0, Math.floor((now - start) / 1000));

    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formattedClockInTime = currentShift?.start_time
    ? new Date(currentShift.start_time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Full Screen Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col items-center text-center space-y-5"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D31010]">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Clock In/Out
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Real-time Clock Display */}
            <div className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedCurrentDate}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {formattedCurrentTime}
              </div>
            </div>

            {/* Shift Status & Timer */}
            {isClockedIn ? (
              <div className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Currently Clocked In</span>
                </div>
                {formattedClockInTime && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    Clocked in at <span className="font-bold text-slate-900 dark:text-white">{formattedClockInTime}</span>
                  </div>
                )}
                <div className="pt-1">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">
                    Running Shift Duration
                  </div>
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-wider">
                    {getElapsedTime()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 space-y-1">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Currently clocked out
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  Press clock in below to start tracking your working hours.
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              disabled={loading}
              onClick={onToggleClock}
              className={`w-full py-3.5 rounded-full text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isClockedIn
                  ? "bg-slate-800 hover:bg-slate-900 shadow-slate-500/20"
                  : "bg-[#D31010] hover:bg-[#b00d0d] shadow-red-500/20"
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isClockedIn ? "Clock out" : "Clock in"}</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
