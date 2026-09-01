import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function DuplicateJobModal({ isOpen, onClose, onConfirm, jobId }) {
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [includeEstimates, setIncludeEstimates] = useState(false);

  if (!isOpen) return null;

  const handleDuplicateSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      includeAttachments,
      includeEstimates,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 p-6 sm:p-7 space-y-5"
        >
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Duplicate job
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Include:
            </p>
          </div>

          <form onSubmit={handleDuplicateSubmit} className="space-y-4">
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#D31010] accent-[#D31010] cursor-pointer"
                />
                <span>Attachments</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEstimates}
                  onChange={(e) => setIncludeEstimates(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#D31010] accent-[#D31010] cursor-pointer"
                />
                <span>Estimates</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg cursor-pointer transition-all"
              >
                Duplicate job
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
