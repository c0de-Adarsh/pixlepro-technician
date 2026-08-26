import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Info } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function AddNewFieldDrawer({ isOpen, onClose, activeTab, onCreated }) {
  const [fieldType, setFieldType] = useState("Text");
  const [group, setGroup] = useState("Extra Info");
  const [fieldName, setFieldName] = useState("");
  const [jobTypes, setJobTypes] = useState("All Job Types");

  const [isRequired, setIsRequired] = useState(false);
  const [isRequiredToClose, setIsRequiredToClose] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fieldName.trim()) {
      toast.error("Please enter a Field Name");
      return;
    }

    const newField = {
      id: "cf_" + Date.now(),
      name: fieldName.trim(),
      group,
      fieldType,
      jobType: jobTypes,
      required: isRequired ? "Yes" : "No",
      requiredToClose: isRequiredToClose ? "Yes" : "No",
      searchable: isSearchable ? "Yes" : "No",
      tab: activeTab,
    };

    toast.success(`Custom Field "${newField.name}" added!`);
    if (onCreated) onCreated(newField);
    setFieldName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Add New Field
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {activeTab === "job" ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Field type
                      </label>
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

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Group
                      </label>
                      <div className="relative">
                        <select
                          value={group}
                          onChange={(e) => setGroup(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                        >
                          <option value="Extra Info">Extra Info</option>
                          <option value="Job Details">Job Details</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>

                    <div>
                      <div className="relative">
                        <select
                          value={jobTypes}
                          onChange={(e) => setJobTypes(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                        >
                          <option value="All Job Types">All Job Types</option>
                          <option value="Home Theater Installation">Home Theater Installation</option>
                          <option value="TV Mounting">TV Mounting</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Required?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsRequired(!isRequired)}
                            className={`px-4 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              isRequired ? "bg-[#D31010] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {isRequired ? "YES" : "NO"}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Required To Close?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsRequiredToClose(!isRequiredToClose)}
                            className={`px-4 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              isRequiredToClose ? "bg-[#D31010] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {isRequiredToClose ? "YES" : "NO"}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">searchable?</span>
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsSearchable(!isSearchable)}
                            className={`px-4 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              isSearchable ? "bg-[#D31010] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {isSearchable ? "YES" : "NO"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Group
                      </label>
                      <div className="relative">
                        <select
                          value={group}
                          onChange={(e) => setGroup(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-900 dark:text-white"
                        >
                          <option value="Extra Info">Extra Info</option>
                          <option value="Client Profile">Client Profile</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Field type
                      </label>
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

                    <div>
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1 pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">searchable?</span>
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSearchable(!isSearchable)}
                          className={`px-4 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                            isSearchable ? "bg-[#D31010] text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {isSearchable ? "YES" : "NO"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
