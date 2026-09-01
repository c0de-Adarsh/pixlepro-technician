import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Calendar,
  ChevronDown,
  Camera,
  Upload,
  Info,
  Layers,
  BookOpen,
  Check,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddEquipmentModal({
  isOpen,
  onClose,
  initialData = null,
  jobItems = [],
  clientEquipmentList = [],
  clientContext = null,
  jobContextId = "",
  defaultSource = "new",
  onSaved,
}) {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState("New equipment");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  const [equipmentName, setEquipmentName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [laborWarranty, setLaborWarranty] = useState("");
  const [manufacturerWarranty, setManufacturerWarranty] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [locationInProperty, setLocationInProperty] = useState("");
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setEquipmentName(initialData.name || "");
      setModelNumber(initialData.model_number || "");
      setBrand(initialData.manufacturer || "");
      setLaborWarranty(initialData.labor_warranty_exp ? String(initialData.labor_warranty_exp).split("T")[0] : "");
      setManufacturerWarranty(initialData.parts_warranty_exp ? String(initialData.parts_warranty_exp).split("T")[0] : "");
      setSerialNumber(initialData.serial_number || "");
      setInstallationDate(initialData.installation_date ? String(initialData.installation_date).split("T")[0] : "");
      setLocationInProperty(initialData.location_in_property || "");
      setNotes(initialData.notes || "");
      setStep(1);
      setSourceType("New equipment");
    } else {
      setEquipmentName("");
      setModelNumber("");
      setBrand("");
      setLaborWarranty("");
      setManufacturerWarranty("");
      setSerialNumber("");
      setInstallationDate(new Date().toISOString().split("T")[0]);
      setLocationInProperty("");
      setNotes("");
      setImagePreview(null);
      setStep(1);
      setSourceType(defaultSource === "job_items" ? "Job items" : defaultSource === "saved_client" ? "Saved client equipment" : "New equipment");
    }
  }, [initialData, defaultSource, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      toast.success("Image selected");
    }
  };

  const handleSelectJobItem = (item) => {
    setEquipmentName(item.name || "");
    setModelNumber(item.model_no || item.modelNo || `MOD-${item.name?.substring(0, 4).toUpperCase() || "EQ"}`);
    setBrand(item.brand || "");
    setNotes(`Added from Job item: ${item.name}`);
    setSourceType("New equipment");
    setStep(1);
    toast.success(`Loaded "${item.name}" details.`);
  };

  const handleSelectSavedEquipment = async (eq) => {
    try {
      setIsSubmitting(true);
      const res = await Api("PUT", `api/equipment/${eq._id}`, {
        job_id: jobContextId || eq.job_id,
      });
      if (res && (res.success || res.data)) {
        toast.success(`Linked "${eq.name}" to this job!`);
        if (onSaved) onSaved(res.data);
        onClose();
      } else {
        toast.error("Failed to link equipment");
      }
    } catch (e) {
      toast.error("Error linking equipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!equipmentName.trim()) {
      toast.error("Please enter Equipment name");
      return;
    }
    if (!modelNumber.trim()) {
      toast.error("Please enter Model #");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: equipmentName.trim(),
        model_number: modelNumber.trim(),
        manufacturer: brand.trim(),
        serial_number: serialNumber.trim(),
        client_name: clientContext?.name || clientContext?.clientName || "Client",
        client_email: clientContext?.email || clientContext?.clientEmail || "",
        phone: clientContext?.phone || "",
        address: clientContext?.address || {},
        installation_date: installationDate || undefined,
        labor_warranty_exp: laborWarranty || undefined,
        parts_warranty_exp: manufacturerWarranty || undefined,
        location_in_property: locationInProperty.trim(),
        notes: notes.trim(),
        job_id: (jobContextId || "").trim(),
      };

      let res;
      if (initialData && initialData._id) {
        res = await Api("PUT", `api/equipment/${initialData._id}`, payload);
      } else {
        res = await Api("POST", "api/equipment", payload);
      }

      if (res && (res.success || res.data)) {
        toast.success(initialData ? "Equipment updated!" : "Equipment added successfully!");
        if (onSaved) onSaved(res.data);
        onClose();
      } else {
        toast.error(res?.message || "Failed to save equipment");
      }
    } catch (err) {
      toast.error("Error saving equipment");
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
          className="relative w-full max-w-[440px] bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {sourceType === "New equipment" && (
            <div className="flex w-full h-1 bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  step === 1 ? "w-1/2 bg-[#3B82F6]" : "w-full bg-[#3B82F6]"
                }`}
              />
            </div>
          )}

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add equipment
              </h3>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span>{sourceType}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showSourceDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowSourceDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 py-1 text-xs font-semibold divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSourceType("New equipment");
                            setShowSourceDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>New equipment</span>
                          {sourceType === "New equipment" && (
                            <Check className="w-3.5 h-3.5 text-[#3B82F6]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSourceType("Job items");
                            setShowSourceDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>Job items</span>
                          {sourceType === "Job items" && (
                            <Check className="w-3.5 h-3.5 text-[#3B82F6]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSourceType("Saved client equipment");
                            setShowSourceDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>Saved client equipment</span>
                          {sourceType === "Saved client equipment" && (
                            <Check className="w-3.5 h-3.5 text-[#3B82F6]" />
                          )}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {sourceType === "Job items" && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-500">
                  Choose from the existing list of items added to this job:
                </p>
                {jobItems.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {jobItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectJobItem(item)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#3B82F6]">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Qty: {item.qty} • ${Number(item.price || 0).toFixed(2)}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#3B82F6]">Select</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl">
                    No items on this job yet. Add items first.
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sourceType === "Saved client equipment" && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-500">
                  Choose from the existing list of equipment saved to this client's profile:
                </p>
                {clientEquipmentList.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {clientEquipmentList.map((eq, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSavedEquipment(eq)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#3B82F6]">
                            {eq.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Model: {eq.model_number} • Serial: {eq.serial_number || "N/A"}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#3B82F6]">Link</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl">
                    No saved equipment found for this client.
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sourceType === "New equipment" && step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    General information
                  </label>

                  <div className="flex gap-3">
                    <label className="relative w-20 h-20 bg-[#344356] hover:bg-[#2b3848] rounded-xl flex flex-col items-center justify-center text-white cursor-pointer flex-shrink-0 transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <>
                          <span className="text-[11px] font-bold leading-tight text-center px-1">
                            Upload Image
                          </span>
                          <div className="absolute left-1.5 bottom-1.5 w-4 h-4 rounded-full bg-[#D31010] flex items-center justify-center text-white font-extrabold text-[10px] shadow-xs">
                            +
                          </div>
                        </>
                      )}
                    </label>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Equipment name"
                        value={equipmentName}
                        onChange={(e) => setEquipmentName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-[#D31010]"
                      />

                      <input
                        type="text"
                        required
                        placeholder="Model #"
                        value={modelNumber}
                        onChange={(e) => setModelNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-[#D31010]"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Brand (optional)"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-[#D31010]"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Warranty terms
                  </label>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Labor warranty (optional)</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        placeholder="Valid thru"
                        value={laborWarranty}
                        onChange={(e) => setLaborWarranty(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:border-[#D31010]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Manufacturer warranty (optional)</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        placeholder="Valid thru"
                        value={manufacturerWarranty}
                        onChange={(e) => setManufacturerWarranty(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:border-[#D31010]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {sourceType === "New equipment" && step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Additional Details
                  </label>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Serial # (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SN-8849201948"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Installation date (optional)
                    </label>
                    <input
                      type="date"
                      value={installationDate}
                      onChange={(e) => setInstallationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 outline-hidden focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Location in property (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Living room, Basement"
                      value={locationInProperty}
                      onChange={(e) => setLocationInProperty(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Additional specifications or mounting instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-hidden resize-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Equipment</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
