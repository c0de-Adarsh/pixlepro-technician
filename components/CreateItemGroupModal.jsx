import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Folder, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function CreateItemGroupModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState("Individual items");
  const [category, setCategory] = useState("");
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
      toast.error("Please enter an item group name");
      return;
    }

    const newGroup = {
      id: "grp_" + Date.now(),
      name: name.trim(),
      description: description.trim() || "-",
      items: "0 items",
      groupType,
      total: "$0.00",
    };

    toast.success(`Item group "${newGroup.name}" created!`);
    if (onCreated) onCreated(newGroup);
    setName("");
    setDescription("");
    setCategory("");
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
            className="relative w-full max-w-4xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Create item group
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
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
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Enable
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 flex justify-center md:justify-start">
                  <label className="relative w-36 h-36 rounded-2xl bg-[#475569] dark:bg-slate-800 flex flex-col items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md overflow-hidden">
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
                </div>

                <div className="md:col-span-9 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Item group name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        placeholder="Item group description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Group type
                    </label>
                    <div className="relative">
                      <select
                        value={groupType}
                        onChange={(e) => setGroupType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                      >
                        <option value="Individual items">Individual items</option>
                        <option value="Package group">Package group</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-400">
                    <option value="">Add items</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Folder className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Choose category (optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="py-3 px-4">Item name</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Cost</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Margin</th>
                        <th className="py-3 px-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      <tr className="h-10">
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold text-xs">
                          No items added to group yet
                        </td>
                      </tr>
                      <tr className="h-10">
                        <td colSpan={6}></td>
                      </tr>
                      <tr className="h-10">
                        <td colSpan={6}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Showing 1 to 0 of 0 results</span>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled className="text-slate-300 dark:text-slate-600 cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Page 1 of 1</span>
                    <button type="button" disabled className="text-slate-300 dark:text-slate-600 cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Total: $0.00
                </div>

                <div className="flex items-center gap-3">
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
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
