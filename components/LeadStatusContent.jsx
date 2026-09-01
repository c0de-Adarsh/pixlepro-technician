import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks,
  Plus,
  RotateCcw,
  Trash2,
  GripVertical,
  Edit2,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Api } from "../services/service";
import { goeyToast as toast } from "goey-toast";
import AddLeadStatusModal from "./AddLeadStatusModal";

export default function LeadStatusContent() {
  const router = useRouter();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const res = await Api("GET", "api/lead-statuses", null, router);
      if (res && res.success && Array.isArray(res.data)) {
        setStatuses(res.data);
      }
    } catch (err) {
      console.error("Fetch lead statuses error:", err);
      toast.error("Failed to load lead statuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleStartEdit = (status) => {
    setEditingId(status._id);
    setEditName(status.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      toast.error("Status name cannot be empty");
      return;
    }
    try {
      const res = await Api("PUT", `api/lead-statuses/${id}`, { name: editName.trim() }, router);
      if (res && res.success) {
        toast.success("Status updated");
        setStatuses((prev) =>
          prev.map((s) => (s._id === id ? { ...s, name: editName.trim() } : s))
        );
        setEditingId(null);
      } else {
        toast.error(res?.message || "Failed to update");
      }
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const res = await Api("DELETE", `api/lead-statuses/${id}`, null, router);
      if (res && res.success) {
        toast.success("Status deleted");
        setStatuses((prev) => prev.filter((s) => s._id !== id));
        setDeletingId(null);
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (e) {
      toast.error("Error deleting status");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm("Are you sure you want to restore default lead statuses? Custom statuses will be replaced.")) {
      return;
    }
    try {
      setIsRestoring(true);
      const res = await Api("POST", "api/lead-statuses/restore-defaults", null, router);
      if (res && res.success) {
        toast.success("Default statuses restored!");
        setStatuses(res.data || []);
      } else {
        toast.error(res?.message || "Failed to restore defaults");
      }
    } catch (e) {
      toast.error("Error restoring defaults");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleMove = async (index, direction) => {
    const newStatuses = [...statuses];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newStatuses.length) return;

    const [moved] = newStatuses.splice(index, 1);
    newStatuses.splice(targetIndex, 0, moved);

    const reordered = newStatuses.map((s, idx) => ({ ...s, order: idx }));
    setStatuses(reordered);

    try {
      await Api(
        "PUT",
        "api/lead-statuses/reorder",
        { statuses: reordered.map((s) => ({ id: s._id, order: s.order })) },
        router
      );
    } catch (e) {
      console.error("Reorder error:", e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        <span
          onClick={() => router.push("/team")}
          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Team
        </span>
        <span>#</span>
        <span
          onClick={() => router.push("/settings/account")}
          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          User
        </span>
        <span>#</span>
        <span
          onClick={() => router.push("/settings")}
          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Security Center
        </span>
        <span>#</span>
        <span
          onClick={() => router.push("/settings/schedule")}
          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Schedule
        </span>
        <span>#</span>
        <span
          onClick={() => router.push("/settings")}
          className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Settings
        </span>
        <span>#</span>
        <span className="text-[#D31010] dark:text-red-400 font-extrabold">Lead Status</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-[#D31010] dark:text-red-400 shadow-sm">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Lead Status
            </h1>
          </div>
        </div>

        {/* Subtitle separator */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Customize your lead statuses according to your work-flow.
        </p>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-red-500/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Status</span>
        </button>

        <button
          type="button"
          onClick={handleRestoreDefaults}
          disabled={isRestoring}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-red-500/25 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isRestoring ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Statuses List Card */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#D31010]" />
            <span className="text-xs font-bold">Loading statuses...</span>
          </div>
        ) : statuses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <p className="text-sm font-bold">No lead statuses found.</p>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl"
            >
              Restore Default Statuses
            </button>
          </div>
        ) : (
          statuses.map((status, index) => (
            <motion.div
              key={status._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              {/* Left Drag Handle & Name */}
              <div className="flex items-center gap-4 flex-1">
                {/* Reorder Buttons / Grip */}
                <div className="flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Status Name / Inline Edit */}
                {editingId === status._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(status._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(status._id)}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span
                      onDoubleClick={() => handleStartEdit(status)}
                      className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 select-none cursor-pointer"
                    >
                      {status.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(status)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity cursor-pointer"
                      title="Edit name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side Delete Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(status._id)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-500 hover:text-red-600 dark:hover:text-red-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Delete Status"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingId(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Status?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this lead status? Leads with this status will need to be updated.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Status Modal */}
      <AddLeadStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={(newStatus) => {
          setStatuses((prev) => [...prev, newStatus]);
        }}
      />
    </div>
  );
}
