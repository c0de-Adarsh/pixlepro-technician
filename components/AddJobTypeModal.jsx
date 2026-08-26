import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddJobTypeModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  initialData = null,
  nextOrder = 14,
}) {
  const router = useRouter();
  const [typeName, setTypeName] = useState(initialData?.name || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.order ?? nextOrder);
  const [days, setDays] = useState(initialData?.durationDays ?? 0);
  const [hours, setHours] = useState(initialData?.durationHours ?? 1);
  const [minutes, setMinutes] = useState(initialData?.durationMinutes ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setTypeName(initialData?.name || "");
    setDisplayOrder(initialData?.order ?? nextOrder);
    setDays(initialData?.durationDays ?? 0);
    setHours(initialData?.durationHours ?? 1);
    setMinutes(initialData?.durationMinutes ?? 0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) {
      toast.error("Please enter a job type name");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      name: typeName.trim(),
      order: Number(displayOrder) || 0,
      durationDays: Number(days) || 0,
      durationHours: Number(hours) || 0,
      durationMinutes: Number(minutes) || 0,
    };

    let durationStr = "";
    if (days > 0) durationStr += `${days} days `;
    if (hours > 0) durationStr += `${hours} hours `;
    if (minutes > 0) durationStr += `${minutes} mins`;
    durationStr = durationStr.trim() || "1 hours";

    try {
      if (initialData) {
        const res = await Api("PUT", `api/job-types/${initialData.id}`, payload, router);
        const updatedObj = res?.data || res || {};
        const formatted = {
          id: initialData.id,
          name: updatedObj.name || typeName.trim(),
          order: updatedObj.order ?? Number(displayOrder) ?? 0,
          duration: updatedObj.durationFormatted || durationStr,
          status: updatedObj.status || initialData.status || "ON",
        };
        toast.success(`Job type "${formatted.name}" updated successfully!`);
        setIsSubmitting(false);
        if (onUpdated) onUpdated(formatted);
        onClose();
      } else {
        const res = await Api("POST", "api/job-types", payload, router);
        const createdObj = res?.data || res || {};
        const newJobType = {
          id: createdObj._id || createdObj.id || "jt_" + Date.now(),
          name: createdObj.name || typeName.trim(),
          order: createdObj.order ?? Number(displayOrder) ?? 0,
          duration: createdObj.durationFormatted || durationStr,
          status: createdObj.status || "ON",
        };

        toast.success(`Job type "${newJobType.name}" added successfully!`);
        setIsSubmitting(false);
        setTypeName("");
        if (onCreated) onCreated(newJobType);
        onClose();
      }
    } catch (err) {
      setIsSubmitting(false);
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {initialData ? "Edit Job Type" : "Add New Job Type"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Job Type Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Job Type Name"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 font-semibold"
                />
              </div>

              {/* Field 2: Display Order */}
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 pl-1">
                  Display Order
                </span>
                <input
                  type="number"
                  placeholder="14"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>

              {/* Field 3: Duration Pickers Grid (Days, Hours, Minutes) */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {/* Days */}
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Days
                    </span>
                    <div className="relative">
                      <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Hours */}
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Hours
                    </span>
                    <div className="relative">
                      <select
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Minutes */}
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Minutes
                    </span>
                    <div className="relative">
                      <select
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        {[0, 15, 30, 45].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-semibold pl-0.5">
                  How long does this type of job usually take?
                </p>
              </div>

              {/* Footer Buttons (Screenshot 2 Match) */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
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
      )}
    </AnimatePresence>
  );
}
