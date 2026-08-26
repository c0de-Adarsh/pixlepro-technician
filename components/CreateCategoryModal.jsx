import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Folder } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function CreateCategoryModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const newCat = {
      id: "cat_" + Date.now(),
      name: name.trim(),
      description: description.trim() || "-",
      parentCategory: parentCategory.trim() || "-",
      activeItems: 0,
    };

    toast.success(`Category "${newCat.name}" created!`);
    if (onCreated) onCreated(newCat);
    setName("");
    setParentCategory("");
    setDescription("");
    setImagePreview(null);
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
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Create new category
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <label className="relative w-32 h-32 rounded-2xl bg-[#475569] dark:bg-slate-800 flex flex-col items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md overflow-hidden flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-200">Upload Image</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-[#D31010] border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-md">
                    <Plus className="w-4 h-4" />
                  </div>
                </label>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <input
                      type="text"
                      placeholder="Category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none">
                      <Folder className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Choose parent category (optional)"
                      value={parentCategory}
                      onChange={(e) => setParentCategory(e.target.value)}
                      className="w-full pl-9 pr-20 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info("Category browser opened")}
                      className="absolute right-3 text-xs font-bold text-[#D31010] hover:underline cursor-pointer"
                    >
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Category description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                      isEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable category
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium pl-14">
                  Turning this off will also disable all subcategories, item groups, and items within this category
                </p>
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
