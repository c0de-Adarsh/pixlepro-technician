import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function AddEstimateItemModal({ isOpen, onClose, onAddItem }) {
  const [searchQuery, setSearchQuery] = useState("");

  const presetItems = [
    { name: "Tv Installation 61\"-75\"", price: 109.99, desc: "Tv Installation for 61 inch to 75 inch screens.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Tv Installation 32\"-55\"", price: 99.99, desc: "Tv Installation for 32 inch to 55 inch screens.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Full motion mount", price: 125.00, desc: "Heavy duty full motion TV wall mount bracket.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Internal Concealment", price: 100.00, desc: "In-wall wire concealment and outlet installation.", badges: ["SERVICE", "TAXABLE"] },
    { name: "tv over fireplace", price: 20.00, desc: "Fireplace mounting surcharge and brick anchoring.", badges: ["SERVICE", "TAXABLE"] },
    { name: "metal studs", price: 15.00, desc: "Metal stud mounting anchors hardware pack.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Hikvision IP turret camera", price: 975.00, desc: "6 IP cameras with NVR 2TB HDD 8mp red/blue siren.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Junction box", price: 49.99, desc: "Standard junction box per camera/housing unit.", badges: ["PRODUCT", "TAXABLE"] },
    { name: "Cat6 cable", price: 178.00, desc: "2 spools outdoor rated PVC shielded Cat6 cable.", badges: ["PRODUCT", "TAXABLE"] },
  ];

  const filteredItems = presetItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (item) => {
    const newItem = {
      id: "item_" + Math.floor(1000 + Math.random() * 9000),
      name: item.name,
      desc: item.desc,
      badges: item.badges,
      quantity: "1.00",
      price: item.price.toFixed(2),
      cost: "0.00",
      amount: item.price.toFixed(2),
      taxable: "Yes",
    };

    toast.success(`Added "${item.name}" to estimate!`);
    if (onAddItem) onAddItem(newItem);
    setSearchQuery("");
    onClose();
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const customItem = {
      id: "item_" + Math.floor(1000 + Math.random() * 9000),
      name: searchQuery.trim(),
      desc: "Custom added estimate item",
      badges: ["PRODUCT", "TAXABLE"],
      quantity: "1.00",
      price: "100.00",
      cost: "0.00",
      amount: "100.00",
      taxable: "Yes",
    };

    toast.success(`Added "${customItem.name}" to estimate!`);
    if (onAddItem) onAddItem(customItem);
    setSearchQuery("");
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
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Add estimate items
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-[#D31010] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white shadow-sm"
                  autoFocus
                />
              </div>

              {searchQuery.trim() !== "" && (
                <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-inner">
                  {filteredItems.length === 0 ? (
                    <button
                      type="submit"
                      className="w-full p-4 text-xs font-bold text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/40 text-left transition-colors cursor-pointer"
                    >
                      + Add "{searchQuery}" as new item ($100.00)
                    </button>
                  ) : (
                    filteredItems.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="w-full p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left text-xs font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <span>{item.name} (${item.price.toFixed(2)})</span>
                        <span className="text-[10px] font-bold text-[#D31010]">Select →</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
