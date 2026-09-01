import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  CheckSquare,
  Sparkles,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  Camera,
  Layers,
  FileCheck,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddChecklistModal({ isOpen, onClose, jobId, onChecklistAdded }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customItems, setCustomItems] = useState([
    { id: "ci-1", label: "Inspect work location & confirm access", type: "pass_fail", required: true },
    { id: "ci-2", label: "Verify hardware serial numbers", type: "pass_fail", required: false },
    { id: "ci-3", label: "Take initial site photo", type: "photo", required: false },
  ]);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemType, setNewItemType] = useState("pass_fail");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Api("GET", "api/checklists/templates")
        .then((res) => {
          if (res && res.data) {
            setTemplates(Array.isArray(res.data) ? res.data : []);
            if (res.data.length > 0) {
              setSelectedTemplate(res.data[0]);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAddCustomItem = () => {
    if (!newItemLabel.trim()) return;
    setCustomItems((prev) => [
      ...prev,
      {
        id: `ci-${Date.now()}`,
        label: newItemLabel.trim(),
        type: newItemType,
        required: false,
      },
    ]);
    setNewItemLabel("");
  };

  const handleRemoveCustomItem = (id) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAttachTemplate = async (template) => {
    if (!jobId) return;
    try {
      setIsSubmitting(true);
      const res = await Api("POST", `api/checklists/job/${jobId}`, {
        template_id: template._id,
        title: template.title,
        description: template.description,
      });
      toast.success(`Checklist "${template.title}" attached to job!`);
      if (onChecklistAdded) onChecklistAdded(res?.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error adding checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomChecklist = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      toast.error("Please enter a checklist title");
      return;
    }
    if (customItems.length === 0) {
      toast.error("Please add at least one item to the checklist");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await Api("POST", `api/checklists/job/${jobId}`, {
        title: customTitle.trim(),
        items: customItems,
      });
      toast.success(`Custom checklist "${customTitle}" added to job!`);
      if (onChecklistAdded) onChecklistAdded(res?.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error creating custom checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#D31010] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Add Checklist to Job
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a standardized industry template or create a custom checklist.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/40 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`pb-2.5 text-xs font-bold border-b-2 mr-6 transition-colors cursor-pointer ${
                !isCustomMode
                  ? "border-[#D31010] text-[#D31010]"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Industry Templates ({templates.length})
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                isCustomMode
                  ? "border-[#D31010] text-[#D31010]"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              + Create Custom Checklist
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!isCustomMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl._id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-[#D31010]/50 transition-all flex flex-col justify-between group shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          {tpl.service_type || "General"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {tpl.items?.length || 0} items
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#D31010] transition-colors">
                        {tpl.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {tpl.description}
                      </p>

                      <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        {tpl.items?.slice(0, 3).map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D31010]" />
                            <span className="truncate">{it.label}</span>
                          </div>
                        ))}
                        {tpl.items?.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400 pl-3">
                            +{tpl.items.length - 3} more checks
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAttachTemplate(tpl)}
                      className="mt-4 w-full py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach to Job</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCreateCustomChecklist} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Checklist Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Site Commissioning"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Checklist Items ({customItems.length})
                  </label>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {customItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400">{idx + 1}.</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.label}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add check item (e.g. Test network connection)"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomItem();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="pass_fail">Pass/Flag/Fail</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="photo">Photo</option>
                      <option value="short_text">Short Text</option>
                      <option value="number">Number</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="px-3.5 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Create & Attach</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
