import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Plus, Wrench, ShieldCheck, MapPin, FileText, CheckCircle2, User, Briefcase } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function EquipmentHistoryModal({ isOpen, onClose, equipment, onHistoryUpdated }) {
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceJobId, setServiceJobId] = useState("");
  const [eventType, setEventType] = useState("Serviced");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !equipment) return null;

  const handleLogService = async (e) => {
    e.preventDefault();
    if (!serviceDesc.trim()) {
      toast.error("Please enter a service description");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        event_type: eventType,
        description: serviceDesc.trim(),
        job_id: serviceJobId.trim(),
      };

      const res = await Api("POST", `api/equipment/${equipment._id}/service`, payload);
      if (res && res.success) {
        toast.success("Service history logged successfully!");
        setServiceDesc("");
        setServiceJobId("");
        setIsAddingService(false);
        if (onHistoryUpdated) {
          onHistoryUpdated(res.data);
        }
      } else {
        toast.error(res?.message || "Failed to log service");
      }
    } catch (err) {
      toast.error("Error logging service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "Installed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Serviced":
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case "Property Updated":
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case "Warranty Updated":
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
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
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {equipment.name}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium">
                  {equipment.model_number}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client: {equipment.client_name} • Serial: {equipment.serial_number || "N/A"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Installation & Service History
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingService(!isAddingService)}
                className="text-xs font-bold text-[#D31010] hover:text-[#b00d0d] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingService ? "Cancel" : "Log New Service"}</span>
              </button>
            </div>

            {isAddingService && (
              <form onSubmit={handleLogService} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
                    >
                      <option value="Serviced">Serviced</option>
                      <option value="Inspected">Inspected</option>
                      <option value="Warranty Updated">Warranty Updated</option>
                      <option value="Note Added">Note Added</option>
                      <option value="Removed">Removed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Linked Job ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1067"
                      value={serviceJobId}
                      onChange={(e) => setServiceJobId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Service Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Annual condenser coil cleaning & filter replacement performed."
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Service Log"}
                  </button>
                </div>
              </form>
            )}

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {Array.isArray(equipment.history) && equipment.history.length > 0 ? (
                equipment.history.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs">
                      {getEventIcon(event.event_type)}
                    </div>

                    <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {event.event_type}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {event.timestamp ? new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        {event.user_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{event.user_name}</span>
                          </span>
                        )}
                        {event.job_id && (
                          <span className="flex items-center gap-1 font-semibold text-[#D31010]">
                            <Briefcase className="w-3 h-3" />
                            <span>
                              Job #{event.job_id.length >= 24 ? event.job_id.slice(-4).toUpperCase() : event.job_id.startsWith("#") ? event.job_id.slice(1) : event.job_id}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No history logged yet.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
