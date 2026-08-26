import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function AddCustomFieldModal({ isOpen, onClose, onSave }) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text");
  const [isVisibleOnList, setIsVisibleOnList] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fieldName.trim()) {
      toast.error("Please enter a custom field name");
      return;
    }

    const newField = {
      name: fieldName.trim(),
      type: fieldType,
      visibleOnList: isVisibleOnList,
    };

    toast.success(`Custom field "${newField.name}" added!`);
    if (onSave) onSave(newField);
    setFieldName("");
    setIsVisibleOnList(false);
    onClose();
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
            className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Add Custom fields
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white shadow-sm"
                  autoFocus
                />
              </div>

              <div>
                <div className="relative">
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Text">Text</option>
                    <option value="Number">Number</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Checkbox">Checkbox</option>
                    <option value="Date">Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="visibleOnList"
                  checked={isVisibleOnList}
                  onChange={(e) => setIsVisibleOnList(e.target.checked)}
                  className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="visibleOnList" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Visible On Item List
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
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
