import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, FileSpreadsheet, User, Plus } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddEstimateModal({ isOpen, onClose, onCreated, onOpenAddClient }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleClients = [
    { name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "(555) 234-5678" },
    { name: "TechCorp Inc.", email: "billing@techcorp.com", phone: "(555) 987-6543" },
    { name: "Riverwood Estates", email: "hoa@riverwood.org", phone: "(555) 456-7890" },
    { name: "David Chen", email: "d.chen@email.com", phone: "(555) 321-7654" },
  ];

  const handleSelectClient = async (client) => {
    setIsSubmitting(true);
    const payload = {
      name: "New Estimate",
      client_name: client.name,
      client_email: client.email,
      created_by_name: "System",
      amount: 4500.0,
      status: "PENDING",
      source_job: "No linked job",
      deposit_due: "-",
    };

    try {
      const res = await Api("POST", "api/estimates", payload, router);
      const createdObj = res?.data || res || {};

      const newEst = {
        id: createdObj._id || createdObj.id || "est_new",
        estimateNumber: createdObj.estimate_number || "EST-2024-1043",
        name: createdObj.name || "New Estimate",
        clientName: client.name,
        clientEmail: client.email,
        createdDate: "Just now",
        createdBy: "System",
        amount: 4500.0,
        status: "PENDING",
        sourceJob: "No linked job",
        depositDue: "-",
      };

      toast.success(`Estimate created for ${client.name}!`);
      setIsSubmitting(false);
      setSearchQuery("");
      if (onCreated) onCreated(newEst);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const filteredClients = sampleClients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

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
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Create New Estimate
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 flex-1 text-center">
              <div className="mx-auto w-64 sm:w-72 h-44 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 p-3 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-3 shadow-md border border-slate-200/80 dark:border-slate-800 text-left space-y-2 transform transition-transform group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#D31010]">PiXL Canada Ltd</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                  </div>
                  <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="absolute inset-x-8 bottom-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 shadow-xl flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white">Create New Estimate</div>
                    <div className="text-[8px] text-slate-400">Before we proceed, please select a client</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                  Before we proceed, please select a client
                </h4>

                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Name, email or phone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
                  />
                </div>

                {searchQuery.trim() !== "" && (
                  <div className="max-w-md mx-auto max-h-40 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg divide-y divide-slate-100 dark:divide-slate-800 text-left">
                    {filteredClients.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 text-center">No clients found</div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.email}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                            <div className="text-[11px] text-slate-400">{client.email}</div>
                          </div>
                          <span className="text-[10px] font-bold text-[#D31010]">Select →</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">- OR -</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push("/clients");
                    }}
                    className="text-sm font-semibold text-[#D31010] hover:text-[#b00d0d] underline transition-colors cursor-pointer inline-block"
                  >
                    Add new client
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
