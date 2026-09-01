import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Wrench, Plus, Check, MapPin, Tv, Layers, ShieldCheck, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function LinkEquipmentModal({
  isOpen,
  onClose,
  item,
  jobEquipment = [],
  clientEquipmentList = [],
  jobId,
  clientName,
  onEquipmentLinked,
  onAddNewEquipment,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState(null);

  if (!isOpen || !item) return null;

  const combinedEquipment = [
    ...jobEquipment.map((e) => ({ ...e, sourceBadge: "On This Job" })),
    ...clientEquipmentList
      .filter((ce) => !jobEquipment.some((je) => je._id === ce._id))
      .map((e) => ({ ...e, sourceBadge: "Client Profile" })),
  ];

  const filtered = combinedEquipment.filter((eq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (eq.name || "").toLowerCase().includes(q) ||
      (eq.model_number || "").toLowerCase().includes(q) ||
      (eq.serial_number || "").toLowerCase().includes(q) ||
      (eq.location_in_property || "").toLowerCase().includes(q) ||
      (eq.manufacturer || "").toLowerCase().includes(q)
    );
  });

  const handleConfirmLink = async (equipment) => {
    try {
      setIsLinking(true);
      setSelectedEqId(equipment._id);

      const serviceRes = await Api("POST", `api/equipment/${equipment._id}/service`, {
        event_type: "Serviced",
        description: `Service performed: ${item.name} ($${Number(item.price || 0).toFixed(2)})`,
        job_id: jobId || "",
      });

      if (jobId && (!equipment.job_id || equipment.job_id !== jobId)) {
        await Api("PUT", `api/equipment/${equipment._id}`, {
          job_id: jobId,
        });
      }

      toast.success(`Successfully linked "${item.name}" to "${equipment.name}"!`);
      if (onEquipmentLinked) {
        onEquipmentLinked(item, equipment);
      }
      onClose();
    } catch (err) {
      toast.error("Failed to link service to equipment");
    } finally {
      setIsLinking(false);
      setSelectedEqId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Link Service to Equipment
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 pl-10">
                Log service history on client equipment for{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {item.name}
                </span>{" "}
                (${Number(item.price || 0).toFixed(2)})
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="p-6 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search equipment name, model, serial, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onAddNewEquipment) onAddNewEquipment(item);
              }}
              className="px-3.5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Equipment</span>
            </button>
          </div>

          {/* Equipment List */}
          <div className="p-6 py-4 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
            {filtered.length > 0 ? (
              filtered.map((eq) => {
                const isSelected = selectedEqId === eq._id;
                return (
                  <div
                    key={eq._id}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {eq.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {eq.sourceBadge}
                        </span>
                        {eq.manufacturer && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            {eq.manufacturer}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-3">
                        <span>Model: {eq.model_number || "—"}</span>
                        {eq.serial_number && <span>• Serial: {eq.serial_number}</span>}
                      </div>

                      {eq.location_in_property && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Location: {eq.location_in_property}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isLinking}
                      onClick={() => handleConfirmLink(eq)}
                      className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSelected && isLinking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Linking...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Link to this</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    No equipment found
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {searchQuery
                      ? "No equipment matches your search query."
                      : "No equipment registered for this client yet."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onAddNewEquipment) onAddNewEquipment(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Equipment & Link</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {filtered.length} equipment unit{filtered.length !== 1 ? "s" : ""} available
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
