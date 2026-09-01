import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  MessageSquare,
  Trash2,
  Loader2,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function FillChecklistModal({
  isOpen,
  onClose,
  checklist,
  onChecklistUpdated,
  onDelete,
}) {
  const [items, setItems] = useState([]);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (checklist) {
      setItems(Array.isArray(checklist.items) ? JSON.parse(JSON.stringify(checklist.items)) : []);
      setExpandedNotes({});
    }
  }, [checklist, isOpen]);

  if (!isOpen || !checklist) return null;

  const completedCount = items.filter((it) => {
    if (it.type === "checkbox") return Boolean(it.value);
    if (it.type === "pass_fail") return it.value === "pass" || it.value === "flag" || it.value === "fail";
    if (it.type === "photo") return Array.isArray(it.photos) && it.photos.length > 0;
    if (it.type === "short_text" || it.type === "long_text" || it.type === "number") {
      return it.value !== null && it.value !== undefined && String(it.value).trim().length > 0;
    }
    if (it.type === "select") return Boolean(it.value);
    return false;
  }).length;

  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handlePassFailChange = (itemId, stateValue) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, value: stateValue } : it))
    );
  };

  const handleCheckboxToggle = (itemId) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, value: !it.value } : it))
    );
  };

  const handleTextChange = (itemId, val) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, value: val } : it))
    );
  };

  const handleNoteChange = (itemId, noteVal) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, notes: noteVal } : it))
    );
  };

  const handleSimulatedPhotoUpload = (itemId) => {
    const dummyPhotoUrl = `https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60`;
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, photos: [...(it.photos || []), dummyPhotoUrl] }
          : it
      )
    );
    toast.success("Photo attached to checklist item!");
  };

  const toggleNote = (itemId) => {
    setExpandedNotes((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSave = async (markComplete = false) => {
    try {
      setIsSaving(true);
      const res = await Api("PUT", `api/checklists/${checklist._id}`, {
        items,
        status: markComplete || progressPercent === 100 ? "completed" : "in_progress",
      });
      toast.success(
        markComplete || progressPercent === 100
          ? "Checklist completed successfully!"
          : "Checklist progress saved!"
      );
      if (onChecklistUpdated) onChecklistUpdated(res?.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error saving checklist");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this checklist?")) return;
    try {
      setIsSaving(true);
      await Api("DELETE", `api/checklists/${checklist._id}`);
      toast.success("Checklist deleted!");
      if (onDelete) onDelete(checklist._id);
      onClose();
    } catch (err) {
      toast.error(err.message || "Error deleting checklist");
    } finally {
      setIsSaving(false);
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]"
        >
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {checklist.title}
                </h3>
                {checklist.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {checklist.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  {completedCount} of {totalCount} checks completed
                </span>
                <span
                  className={
                    progressPercent === 100
                      ? "text-emerald-600 dark:text-emerald-400 font-black"
                      : "text-[#D31010] font-black"
                  }
                >
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    progressPercent === 100 ? "bg-emerald-500" : "bg-[#D31010]"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.map((item, idx) => {
              const isNoteOpen = expandedNotes[item.id] || (item.notes && item.notes.trim().length > 0);

              return (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">{idx + 1}.</span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        {item.required && (
                          <span className="text-[10px] font-bold text-red-500">*Required</span>
                        )}
                      </div>
                      {item.instructions && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4">
                          {item.instructions}
                        </p>
                      )}
                    </div>

                    {item.type === "pass_fail" && (
                      <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handlePassFailChange(item.id, "pass")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            item.value === "pass"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePassFailChange(item.id, "flag")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            item.value === "flag"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flag</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePassFailChange(item.id, "fail")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            item.value === "fail"
                              ? "bg-red-500 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Fail</span>
                        </button>
                      </div>
                    )}

                    {item.type === "checkbox" && (
                      <button
                        type="button"
                        onClick={() => handleCheckboxToggle(item.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          item.value
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{item.value ? "Completed" : "Mark Done"}</span>
                      </button>
                    )}

                    {item.type === "photo" && (
                      <button
                        type="button"
                        onClick={() => handleSimulatedPhotoUpload(item.id)}
                        className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{item.photos?.length > 0 ? `Attach more (${item.photos.length})` : "Attach Photo"}</span>
                      </button>
                    )}
                  </div>

                  {(item.type === "short_text" || item.type === "number") && (
                    <input
                      type={item.type === "number" ? "number" : "text"}
                      placeholder="Enter value..."
                      value={item.value || ""}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  )}

                  {item.type === "long_text" && (
                    <textarea
                      rows={2}
                      placeholder="Enter details..."
                      value={item.value || ""}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  )}

                  {item.photos && item.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.photos.map((pUrl, pIdx) => (
                        <img
                          key={pIdx}
                          src={pUrl}
                          alt="Check photo"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                      ))}
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleNote(item.id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{isNoteOpen ? "Hide note" : item.notes ? "Edit note" : "+ Add note"}</span>
                    </button>

                    {isNoteOpen && (
                      <input
                        type="text"
                        placeholder="Add note for this check..."
                        value={item.notes || ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 flex-shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete checklist</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(progressPercent === 100)}
                className="px-7 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{progressPercent === 100 ? "Submit & Complete" : "Save Progress"}</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
