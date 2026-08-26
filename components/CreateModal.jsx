import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, CheckCircle, Briefcase, User, Calendar, DollarSign } from "lucide-react";

export default function CreateModal({ isOpen, onClose }) {
  const [activeType, setActiveType] = useState("job");
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle("");
      setClient("");
      setAmount("");
      onClose();
    }, 1200);
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

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-xl text-[#D31010]">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Operation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add a new job, lead, or estimate</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-3"
              >
                <CheckCircle className="w-14 h-14 text-emerald-500 animate-bounce" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Success!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">New operation has been created.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "job", label: "Job", icon: Briefcase },
                    { id: "lead", label: "Lead", icon: User },
                    { id: "estimate", label: "Estimate", icon: DollarSign },
                  ].map((type) => {
                    const Icon = type.icon;
                    const isSel = activeType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setActiveType(type.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                          isSel
                            ? "bg-[#D31010] text-white border-[#D31010] shadow-md shadow-red-500/20"
                            : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Title / Operation Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Residential Solar Installation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Client Name</label>
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                  >
                    Create Operation
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
