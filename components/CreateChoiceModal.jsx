import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CreateChoiceModal({
  isOpen,
  onClose,
  slotInfo = "Sun, Aug 16 • 12:00am - 12:15am",
  onContinueJob,
  onContinueEvent,
}) {
  const [selectedType, setSelectedType] = useState("job"); // "job" | "event"

  const handleContinue = () => {
    onClose();
    if (selectedType === "event") {
      if (onContinueEvent) onContinueEvent();
    } else {
      if (onContinueJob) onContinueJob();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card (Screenshot 1) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 text-slate-800 dark:text-slate-100 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                What would you like to create?
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {slotInfo}
              </p>

              <div className="space-y-3 pt-1">
                {/* Radio Option 1: Job (Default) */}
                <label
                  onClick={() => setSelectedType("job")}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedType === "job"
                      ? "border-[#D31010] bg-red-50/40 dark:bg-red-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="createChoice"
                    checked={selectedType === "job"}
                    onChange={() => setSelectedType("job")}
                    className="w-4 h-4 text-[#D31010] accent-[#D31010]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Job
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Create a new job for field technician dispatch
                    </span>
                  </div>
                </label>

                {/* Radio Option 2: Event */}
                <label
                  onClick={() => setSelectedType("event")}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedType === "event"
                      ? "border-[#D31010] bg-red-50/40 dark:bg-red-950/20 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="createChoice"
                    checked={selectedType === "event"}
                    onChange={() => setSelectedType("event")}
                    className="w-4 h-4 text-[#D31010] accent-[#D31010]"
                  />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Event
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Buttons (Solid Red #D31010 Continue Button) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="px-8 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
