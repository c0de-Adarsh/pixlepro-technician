import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Tag, Check, Plus, Loader2, FileText, Briefcase } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddTaskModal({
  isOpen,
  onClose,
  initialData = null,
  jobContext = null,
  onSaved,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("10:00 AM");
  const [assignedTech, setAssignedTech] = useState("PIXL TECHNICIAN");
  const [availableTechs, setAvailableTechs] = useState(["PIXL TECHNICIAN"]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [status, setStatus] = useState("open");
  const [jobId, setJobId] = useState("");
  const [clientName, setClientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetTags = [
    "Parts",
    "Permit",
    "Inspection",
    "Follow up",
    "Site Survey",
    "Quality Check",
    "Payment",
    "Warranty",
  ];

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await Api("GET", "api/teams");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const names = list
          .map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim())
          .filter(Boolean);
        if (names.length > 0) {
          setAvailableTechs(Array.from(new Set(["PIXL TECHNICIAN", ...names])));
        }
      } catch (e) {}
    };

    if (isOpen) {
      fetchTeamMembers();
    }

    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDueDate(initialData.due_date ? String(initialData.due_date).split("T")[0] : "");
      setDueTime(initialData.due_time || "10:00 AM");
      setAssignedTech(initialData.assigned_tech || "PIXL TECHNICIAN");
      setSelectedTags(Array.isArray(initialData.tags) ? initialData.tags : []);
      setStatus(initialData.status || "open");
      setJobId(initialData.job_id || "");
      setClientName(initialData.client_name || "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate(new Date().toISOString().split("T")[0]);
      setDueTime("10:00 AM");
      setAssignedTech(jobContext?.assigned_tech || "PIXL TECHNICIAN");
      setSelectedTags([]);
      setStatus("open");
      setJobId(jobContext?.id || jobContext?.job_id || "");
      setClientName(jobContext?.client_name || "");
    }
  }, [isOpen, initialData, jobContext]);

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
      setCustomTagInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate ? new Date(dueDate) : null,
        due_time: dueTime.trim(),
        assigned_tech: assignedTech.trim(),
        tags: selectedTags,
        status,
        job_id: jobId ? String(jobId).trim() : "",
        client_name: clientName ? clientName.trim() : "",
      };

      let res;
      if (initialData?._id) {
        res = await Api("PUT", `api/tasks/${initialData._id}`, payload);
        toast.success("Task updated successfully!");
      } else {
        res = await Api("POST", "api/tasks", payload);
        toast.success("Task created successfully!");
      }

      if (onSaved) {
        onSaved(res?.data || payload);
      }
      onClose();
    } catch (err) {
      toast.error("Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? "Edit Task" : "Add New Task"}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
            {/* Title */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5">
                Task Title <span className="text-[#D31010]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Order 75-inch mounting bracket, City permit check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5">
                Description & Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Add any specific instructions or requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 resize-none"
              />
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Time</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM, 02:30 PM"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>
            </div>

            {/* Assigned Tech & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign To</span>
                </label>
                <select
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {availableTechs.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="open">Open (Pending)</option>
                  <option value="done">Done (Completed)</option>
                </select>
              </div>
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Tags / Category</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {presetTags.map((t) => {
                  const isSelected = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTag(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[#D31010] text-white border-[#D31010]"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Add custom tag"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white rounded-xl shadow-md shadow-red-500/20 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{initialData ? "Update Task" : "Create Task"}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
