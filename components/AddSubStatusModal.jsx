import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ChevronDown } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import { useRouter } from "next/router";

const COLOR_PALETTE = [
  "#94A3B8",
  "#059669",
  "#65A30D",
  "#EA580C",
  "#475569",
  "#334155",
  "#0284C7",
  "#2563EB",
  "#0052CC",
  "#DC2626",
  "#F43F5E",
  "#F59E0B",
  "#D97706",
  "#EAB308",
  "#16A34A",
  "#9333EA",
  "#C026D3",
  "#7C3AED",
  "#4F46E5",
  "#0F172A",
];

const PARENT_STATUSES = [
  "In progress",
  "Canceled",
  "Pending",
  "Done pending approval",
  "Submitted",
  "Done",
];

export default function AddSubStatusModal({ isOpen, onClose, onCreated }) {
  const router = useRouter();
  const [parentStatus, setParentStatus] = useState("In progress");
  const [subName, setSubName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#0052CC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) {
      toast.error("Please enter a sub status name");
      return;
    }
    if (!parentStatus) {
      toast.error("Please select a parent status");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: subName.trim(),
        parent_status: parentStatus,
        color: selectedColor,
      };
      const res = await Api("POST", "api/sub-statuses", payload, router);
      if (res && (res.success || res.data || res._id)) {
        toast.success(`Sub status "${subName.trim()}" created successfully!`);
        if (onCreated) {
          onCreated(res.data || res);
        }
        setSubName("");
        setParentStatus("In progress");
        setSelectedColor("#0052CC");
        onClose();
      } else {
        toast.error(res?.message || "Failed to create sub status");
      }
    } catch (err) {
      toast.error("Error creating sub status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Add Sub status
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Create a sub status under a parent job status to show more detailed progress on the job and schedule
            </p>

            {/* Parent Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select parent status
              </label>
              <div className="relative">
                <select
                  value={parentStatus}
                  onChange={(e) => setParentStatus(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 cursor-pointer"
                >
                  {PARENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                Choose the parent job status that this sub status will fall under
              </p>
            </div>

            {/* Sub Status Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Sub status name
              </label>
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Taken, Parts Ordered, En Route"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Color Palette */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Color
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {COLOR_PALETTE.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110"
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !subName.trim()}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
