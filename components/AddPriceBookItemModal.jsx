import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Folder, ChevronDown, Check } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import AddCustomFieldModal from "./AddCustomFieldModal";
import { Api } from "../services/service";

export default function AddPriceBookItemModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState("Service");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [unitCost, setUnitCost] = useState("0.00");
  const [isTaxable, setIsTaxable] = useState(true);
  const [addToBooking, setAddToBooking] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter item title");
      return;
    }

    try {
      const payload = {
        name: title.trim(),
        description: description.trim(),
        price: parseFloat(price || 0),
        cost: parseFloat(unitCost || 0),
        type: itemType,
        category: category.trim(),
        model_no: modelNo.trim(),
        booking: addToBooking ? "Yes" : "No",
        taxable: isTaxable,
      };

      const res = await Api("post", "api/price-book", payload);
      const createdItem = res?.data || res;

      const formattedItem = {
        id: createdItem.item_id || String(createdItem._id),
        _id: createdItem._id,
        name: createdItem.name,
        description: createdItem.description || "",
        price: typeof createdItem.price === "number" ? `$${createdItem.price.toFixed(2)}` : createdItem.price,
        cost: typeof createdItem.cost === "number" ? `$${createdItem.cost.toFixed(2)}` : createdItem.cost,
        type: createdItem.type || "Service",
        category: createdItem.category || "",
        modelNo: createdItem.model_no || "",
        brand: createdItem.brand || "",
        booking: createdItem.booking || "No",
        inventory: createdItem.inventory || "No",
        hasImage: !!imagePreview,
      };

      toast.success(`Item "${formattedItem.name}" added to Price Book!`);
      if (onCreated) onCreated(formattedItem);
      setTitle("");
      setModelNo("");
      setCategory("");
      setDescription("");
      setPrice("0.00");
      setUnitCost("0.00");
      setImagePreview(null);
      onClose();
    } catch (err) {
      toast.error(err?.error || err?.message || "Failed to create price book item");
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
            className="relative w-full max-w-4xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Add New Item
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1">
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                <div className="lg:col-span-3 flex flex-col items-center">
                  <label className="relative w-36 h-36 rounded-2xl bg-[#475569] dark:bg-slate-800 flex flex-col items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md overflow-hidden group">
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

                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Model #"
                      value={modelNo}
                      onChange={(e) => setModelNo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
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

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Item type
                    </label>
                    <div className="relative">
                      <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                      >
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                        <option value="Hours">Hours</option>
                        <option value="Expense">Expense</option>
                        <option value="Warranty">Warranty</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={4}
                      placeholder="Item Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setIsCustomFieldModalOpen(true)}
                      className="text-xs font-bold text-[#D31010] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>+ Add custom fields</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Unit Cost
                    </label>
                    <input
                      type="text"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Taxable item
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTaxable(!isTaxable)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                        isTaxable ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-emerald-600 ${
                          isTaxable ? "translate-x-6" : "translate-x-0"
                        }`}
                      >
                        {isTaxable && <Check className="w-3 h-3 text-emerald-600" />}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Add to booking items
                    </span>
                    <button
                      type="button"
                      onClick={() => setAddToBooking(!addToBooking)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                        addToBooking ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                          addToBooking ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
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

            <AddCustomFieldModal
              isOpen={isCustomFieldModalOpen}
              onClose={() => setIsCustomFieldModalOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
