import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function EditEstimateItemModal({ isOpen, onClose, itemData, onSave }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1.00");
  const [price, setPrice] = useState("975.00");
  const [markup, setMarkup] = useState("0");
  const [cost, setCost] = useState("0.00");
  const [description, setDescription] = useState("");
  const [isTaxable, setIsTaxable] = useState(true);
  const [isOptional, setIsOptional] = useState(false);

  useEffect(() => {
    if (itemData) {
      setItemName(itemData.name || "");
      setQuantity(itemData.quantity || "1.00");
      setPrice(itemData.price || "0.00");
      setMarkup(itemData.markup || "0");
      setCost(itemData.cost || "0.00");
      setDescription(itemData.desc || "");
      setIsTaxable(itemData.taxable === "Yes");
      setIsOptional(!!itemData.isOptional);
    }
  }, [itemData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    const updatedItem = {
      ...itemData,
      name: itemName.trim(),
      quantity,
      price,
      markup,
      cost,
      desc: description,
      taxable: isTaxable ? "Yes" : "No",
      isOptional,
      amount: (parseFloat(quantity || 0) * parseFloat(price || 0)).toFixed(2),
    };

    toast.success(`Item "${updatedItem.name}" updated!`);
    if (onSave) onSave(updatedItem);
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
                Edit estimate items
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
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-1.5">
                  ITEM NAME
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-1.5">
                    QUANTITY
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-1.5">
                    PRICE
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-1.5">
                    MARKUP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={markup}
                      onChange={(e) => setMarkup(e.target.value)}
                      className="w-full pl-3 pr-6 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-1.5">
                    COST
                  </label>
                  <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Taxable Item
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTaxable(!isTaxable)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                      isTaxable ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        isTaxable ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Optional Item
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOptional(!isOptional)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                      isOptional ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                        isOptional ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Close
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
