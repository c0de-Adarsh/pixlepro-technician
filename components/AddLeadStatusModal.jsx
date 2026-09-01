import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Api } from "../services/service";
import { useRouter } from "next/router";
import { goeyToast as toast } from "goey-toast";

export default function AddLeadStatusModal({ isOpen, onClose, onAdded }) {
  const router = useRouter();
  const [statusName, setStatusName] = useState("");
  const [color, setColor] = useState("#F59E0B");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statusName.trim()) {
      toast.error("Please enter status name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await Api("POST", "api/lead-statuses", { name: statusName.trim(), color }, router);
      if (res && res.success) {
        toast.success(res.message || "Lead status added successfully");
        setStatusName("");
        if (onAdded) onAdded(res.data);
        onClose();
      } else {
        toast.error(res?.message || "Failed to add lead status");
      }
    } catch (err) {
      console.error("Add lead status error:", err);
      toast.error("Error adding lead status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Status
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Name
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="Status Name"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-all cursor-pointer min-w-[100px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !statusName.trim()}
                className="px-7 py-2.5 rounded-xl bg-[#D31010] hover:bg-[#b00d0d] text-white text-sm font-bold shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
