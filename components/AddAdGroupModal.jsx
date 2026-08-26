import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddAdGroupModal({
  isOpen,
  onClose,
  onCreated,
  onUpdated,
  initialData = null,
  nextOrder = 7,
}) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [displayOrder, setDisplayOrder] = useState(String(nextOrder));
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setGroupName(initialData.name || "");
      setDisplayOrder(String(initialData.displayOrder || initialData.order || 1));
      setDescription(initialData.description === "-" ? "" : initialData.description || "");
    } else {
      setGroupName("");
      setDisplayOrder(String(nextOrder));
      setDescription("");
    }
  }, [initialData, isOpen, nextOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter an Ad group name");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: groupName.trim(),
      order: Number(displayOrder) || 1,
      description: description.trim() || "",
    };

    try {
      if (initialData && initialData.id) {
        const res = await Api("PUT", `api/ad-groups/${initialData.id}`, payload, router);
        const updatedObj = res?.data || res || {};

        const updatedGroup = {
          id: initialData.id,
          name: updatedObj.name || groupName.trim(),
          description: updatedObj.description || description.trim() || "-",
          displayOrder: updatedObj.order || displayOrder || "1",
          status: initialData.status ?? true,
        };

        toast.success(`Ad group "${updatedGroup.name}" updated successfully!`);
        setIsSubmitting(false);
        if (onUpdated) onUpdated(updatedGroup);
        onClose();
      } else {
        const res = await Api("POST", "api/ad-groups", payload, router);
        const createdObj = res?.data || res || {};

        const newAdGroup = {
          id: createdObj._id || createdObj.id || "ag_" + Date.now(),
          name: createdObj.name || groupName.trim(),
          description: createdObj.description || description.trim() || "-",
          displayOrder: createdObj.order || displayOrder || "1",
          status: true,
        };

        toast.success(`Ad group "${newAdGroup.name}" added successfully!`);
        setIsSubmitting(false);
        if (onCreated) onCreated(newAdGroup);
        setGroupName("");
        setDescription("");
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
            className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {initialData ? "Edit Ad Group" : "Add new Ad Group"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              <div>
                <input
                  type="text"
                  placeholder="Ad group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
