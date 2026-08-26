import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function CreateReportModal({ isOpen, onClose, onCreated }) {
  const [reportName, setReportName] = useState("");
  const [category, setCategory] = useState("Jobs");
  const [dateRange, setDateRange] = useState("This Month");
  const [chartType, setChartType] = useState("Bar Chart");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportName.trim()) {
      toast.error("Please enter report name");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(`Custom report "${reportName}" created!`);
      setIsSubmitting(false);
      if (onCreated) onCreated({ reportName, category, dateRange, chartType });
      onClose();
    }, 600);
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create custom report
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Report Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Monthly Technician Efficiency"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Category
                  </span>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <option value="Jobs">Jobs</option>
                      <option value="Sales">Sales</option>
                      <option value="Payments">Payments</option>
                      <option value="Invoices">Invoices</option>
                      <option value="Activity">Activity</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Date Range
                  </span>
                  <div className="relative">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="This Quarter">This Quarter</option>
                      <option value="Year to Date">Year to Date</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Chart Type
                </span>
                <div className="relative">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <option value="Bar Chart">Bar Chart</option>
                    <option value="Line Chart">Line Chart</option>
                    <option value="Pie Chart">Pie Chart</option>
                    <option value="Data Table">Data Table</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Report</span>
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
