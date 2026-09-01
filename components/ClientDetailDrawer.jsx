import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Phone,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Wrench,
  FileText,
  FileEdit,
  User,
  MapPin,
  CreditCard,
  Building,
  Search,
  Check,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddAdditionalContactModal from "./AddAdditionalContactModal";
import AddEquipmentModal from "./AddEquipmentModal";
import EquipmentHistoryModal from "./EquipmentHistoryModal";

export default function ClientDetailDrawer({ isOpen, onClose, client }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("All");

  const [clientEquipment, setClientEquipment] = useState([]);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [historyModalEquipment, setHistoryModalEquipment] = useState(null);

  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isAdditionalContactsOpen, setIsAdditionalContactsOpen] = useState(true);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);

  const [additionalContacts, setAdditionalContacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [clientTags, setClientTags] = useState([]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [tagModalView, setTagModalView] = useState("list");
  const [tagSearch, setTagSearch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagColor, setSelectedTagColor] = useState("#2563EB");

  const [allAvailableTags, setAllAvailableTags] = useState([]);
  const [selectedPendingTags, setSelectedPendingTags] = useState([]);

  const tagColorPalette = [
    "#3B82F6", "#2563EB", "#1D4ED8", "#DC2626", "#E11D48", "#F97316", "#FBBF24", "#D97706",
    "#10B981", "#059669", "#8B5CF6", "#A855F7", "#D946EF", "#4F46E5", "#334155", "#0F172A"
  ];

  const clientName = client?.clientName || client?.name || "Client";
  const companyName = client?.companyName || "";
  const phone = client?.phone || "";
  const secondaryPhone = client?.secondaryPhone || client?.phone || "";
  const email = client?.email || client?.clientEmail || "";
  const address = client?.address || "";
  const jobId = client?.jobId || client?.id || "";
  const jobTitle = client?.jobTitle || "";
  const scheduled = client?.scheduled || "";
  const tech = client?.tech || "PIXL TECHNICIAN";
  const clientId = client?.clientId || "";
  const source = client?.source || "web";

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await Api("GET", "api/tags", null, router);
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAllAvailableTags(data);
      } catch (err) {
        setAllAvailableTags([]);
      }
    };

    const fetchClientEquipment = async () => {
      const targetName = client?.clientName || client?.name || clientName;
      if (!targetName) return;
      try {
        const res = await Api("GET", `api/equipment?client_name=${encodeURIComponent(targetName)}`);
        const data = Array.isArray(res?.data) ? res.data : [];
        setClientEquipment(data);
      } catch (e) {
        setClientEquipment([]);
      }
    };

    if (isOpen) {
      fetchTags();
      fetchClientEquipment();
    }
  }, [isOpen, client, router]);

  useEffect(() => {
    if (client) {
      const initTags = Array.isArray(client.tags) ? client.tags : [];
      setClientTags(initTags);
      setSelectedPendingTags(initTags);
    } else {
      setClientTags([]);
      setSelectedPendingTags([]);
    }
  }, [client]);

  const filteredAvailableTags = useMemo(() => {
    if (!tagSearch.trim()) return allAvailableTags;
    return allAvailableTags.filter((t) =>
      t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [allAvailableTags, tagSearch]);

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes((prev) => [
      { id: Date.now(), text: newNoteText.trim(), date: "Just now", author: "PIXL TECHNICIAN" },
      ...prev,
    ]);
    setNewNoteText("");
    setIsAddingNote(false);
    toast.success("Note added!");
  };

  const handleContactAdded = (newContact) => {
    setAdditionalContacts((prev) => [...prev, newContact]);
  };

  const handleSaveNewTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }
    const name = newTagName.trim();
    const color = selectedTagColor;
    try {
      const res = await Api("POST", "api/tags", { name, color }, router);
      const created = res?.data || { name, color };
      setAllAvailableTags((prev) => [...prev.filter((t) => t.name !== name), created]);
      const nextTags = Array.from(new Set([...clientTags, name]));
      setClientTags(nextTags);
      setSelectedPendingTags(nextTags);

      if (jobId) {
        await Api("PUT", `api/events/${jobId}`, { tags: nextTags }, router);
      }

      setTagModalView("list");
      setIsTagPopoverOpen(false);
      toast.success(`Tag "${name}" created and saved to database!`);
    } catch (err) {
      const newTag = { name, color };
      setAllAvailableTags((prev) => [...prev, newTag]);
      setClientTags((prev) => [...prev, name]);
      setTagModalView("list");
      setIsTagPopoverOpen(false);
      toast.success(`Tag "${name}" created!`);
    }
  };

  const handleApplyTags = async () => {
    setClientTags(selectedPendingTags);
    setIsTagPopoverOpen(false);
    try {
      if (jobId) {
        await Api("PUT", `api/events/${jobId}`, { tags: selectedPendingTags }, router);
      }
      toast.success("Tags updated successfully!");
    } catch (err) {
      toast.success("Tags applied!");
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const nextTags = clientTags.filter((t) => t !== tagToRemove);
    setClientTags(nextTags);
    setSelectedPendingTags(nextTags);
    try {
      if (jobId) {
        await Api("PUT", `api/events/${jobId}`, { tags: nextTags }, router);
      }
    } catch (err) {}
  };

  const historyItems = useMemo(() => {
    const items = [];
    if (jobId) {
      items.push({
        id: `job_${jobId}`,
        type: "Jobs",
        title: `Job ID: ${jobId}${jobTitle ? ` - ${jobTitle}` : ""} created`,
        details: [
          scheduled ? `Scheduled: ${scheduled}` : null,
          address ? `Address: ${address}` : null,
          tech ? `Assigned tech: ${tech}` : null,
        ].filter(Boolean),
        date: client?.createdAt ? new Date(client.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Recent",
        icon: Wrench,
        iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      });
    }

    if (clientId || clientName) {
      items.push({
        id: `client_${clientId || "reg"}`,
        type: "Clients",
        title: `Client Profile ${clientName || clientId} created`,
        details: [source ? `Source: ${source}` : null].filter(Boolean),
        date: client?.createdAt ? new Date(client.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Recent",
        icon: User,
        iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
      });
    }

    return items;
  }, [jobId, jobTitle, scheduled, address, tech, clientId, clientName, source, client]);

  const filteredHistory = useMemo(() => {
    if (!historyFilter || historyFilter === "All") return historyItems;
    return historyItems.filter((item) => item.type === historyFilter);
  }, [historyItems, historyFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-[420px] bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {clientName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {companyName}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/clients`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Open full client page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Top Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
                {[
                  { id: "about", label: "About" },
                  { id: "history", label: "History" },
                  { id: "equipment", label: "Equipment" },
                  { id: "notes", label: "Notes" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-2.5 transition-colors relative cursor-pointer ${
                        isActive
                          ? "text-slate-900 dark:text-white font-extrabold"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D31010]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-semibold">
              {/* TAB 1: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  {/* Contact Section */}
                  <div className="space-y-2.5">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      CONTACT
                    </span>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {phone}
                      </span>
                      <a
                        href={`tel:${phone}`}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        title={phone}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {secondaryPhone}
                    </div>

                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      {email}
                    </div>

                    {/* Active Tag Pills */}
                    {clientTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {clientTags.map((tag) => {
                          const tagObj = allAvailableTags.find((t) => t.name === tag) || { name: tag, color: "#2563EB" };
                          return (
                            <span
                              key={tag}
                              style={{ backgroundColor: tagObj.color }}
                              className="px-2.5 py-1 text-[11px] font-bold text-white rounded-md flex items-center gap-1.5 shadow-xs"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Tag Toggle Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTagPopoverOpen(!isTagPopoverOpen);
                          setTagModalView("list");
                          setSelectedPendingTags(clientTags);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add tag</span>
                      </button>
                    </div>

                    {/* Tag Popover Box */}
                    {isTagPopoverOpen && (
                      <div className="mt-3 p-4 bg-white dark:bg-[#061322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4">
                        {/* LIST VIEW (Screenshot 1) */}
                        {tagModalView === "list" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                Available tags ({filteredAvailableTags.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTagModalView("create");
                                  setNewTagName("");
                                }}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Create new</span>
                              </button>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search tags"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                className="w-full pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                              />
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                              {filteredAvailableTags.length > 0 ? (
                                filteredAvailableTags.map((t) => {
                                  const isSelected = selectedPendingTags.includes(t.name);
                                  return (
                                    <label
                                      key={t.name}
                                      className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: t.color }}
                                        />
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                          {t.name}
                                        </span>
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedPendingTags((prev) => [...prev, t.name]);
                                          } else {
                                            setSelectedPendingTags((prev) => prev.filter((x) => x !== t.name));
                                          }
                                        }}
                                        className="w-4 h-4 rounded text-[#D31010] accent-[#D31010] cursor-pointer"
                                      />
                                    </label>
                                  );
                                })
                              ) : (
                                <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                                  No tags available
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={handleApplyTags}
                                className="px-5 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* CREATE VIEW (Screenshot 2) */}
                        {tagModalView === "create" && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white">
                              <button
                                type="button"
                                onClick={() => setTagModalView("list")}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span>Create new tag</span>
                            </div>

                            <input
                              type="text"
                              placeholder="Enter tag name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                              autoFocus
                            />

                            <div className="space-y-2">
                              <span className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                                Choose color
                              </span>
                              <div className="grid grid-cols-8 gap-2">
                                {tagColorPalette.map((color) => {
                                  const isSelected = selectedTagColor === color;
                                  return (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setSelectedTagColor(color)}
                                      style={{ backgroundColor: color }}
                                      className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xs"
                                    >
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => setTagModalView("list")}
                                className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveNewTag}
                                className="px-5 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accordions */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                    {/* Addresses Accordion */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => setIsAddressesOpen(!isAddressesOpen)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {isAddressesOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Addresses</span>
                        </span>
                      </button>
                      {isAddressesOpen && (
                        <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {address}
                        </div>
                      )}
                    </div>

                    {/* Additional Contacts Accordion */}
                    <div className="py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setIsAdditionalContactsOpen(!isAdditionalContactsOpen)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {isAdditionalContactsOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Additional contacts ({additionalContacts.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddContactModalOpen(true)}
                          className="p-1 text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Add additional contact"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {isAdditionalContactsOpen && (
                        <div>
                          {additionalContacts.length > 0 ? (
                            <div className="space-y-2 pt-1">
                              {additionalContacts.map((c, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-0.5 border border-slate-100 dark:border-slate-800"
                                >
                                  <div className="font-extrabold text-slate-900 dark:text-white">
                                    {c.name} {c.role ? <span className="text-[10px] text-slate-400 font-normal">({c.role})</span> : null}
                                  </div>
                                  {c.phone && <div className="text-[11px] text-slate-600 dark:text-slate-400">{c.phone}</div>}
                                  {c.email && <div className="text-[11px] text-blue-500">{c.email}</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="5" y="4" width="14" height="16" rx="2" />
                                  <circle cx="12" cy="10" r="3" />
                                  <path d="M8 17c0-2 2-3 4-3s4 1 4 3" />
                                </svg>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold">
                                Add additional contact for this client
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Payment methods Accordion */}
                    <div className="py-3">
                      <button
                        type="button"
                        onClick={() => setIsPaymentMethodsOpen(!isPaymentMethodsOpen)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {isPaymentMethodsOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Payment methods (0)</span>
                        </span>
                      </button>
                      {isPaymentMethodsOpen && (
                        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-500">
                          No payment methods saved yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORY */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  {/* Top Filters Select */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400">Filters</label>
                    <div className="relative">
                      <select
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="All">All</option>
                        <option value="Estimates">Estimates</option>
                        <option value="Invoices">Invoices</option>
                        <option value="Jobs">Jobs</option>
                        <option value="Clients">Clients</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6 pt-2 pb-4">
                    {filteredHistory.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={item.id} className="relative pl-6">
                          <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full ${item.iconBg} border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                              {item.title}
                            </h4>

                            {item.details && item.details.length > 0 && (
                              <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 space-y-0.5">
                                {item.details.map((d, idx) => (
                                  <div key={idx}>{d}</div>
                                ))}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                              {item.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-5">
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(!isAddingNote)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add note</span>
                    </button>
                  </div>

                  {isAddingNote && (
                    <form onSubmit={handleAddNoteSubmit} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <textarea
                        rows={3}
                        placeholder="Write a client note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingNote(false)}
                          className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-lg shadow-md cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="4" y="5" width="16" height="16" rx="2" />
                          <line x1="9" y1="2" x2="9" y2="6" />
                          <line x1="15" y1="2" x2="15" y2="6" />
                          <path d="M8 12h8M8 16h5" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-slate-500 max-w-[240px]">
                        No notes yet. Add one to keep your team aligned.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((n) => (
                        <div key={n.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                          <span className="text-[10px] text-slate-400">{n.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* TAB: EQUIPMENT */}
              {activeTab === "equipment" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      CLIENT EQUIPMENT ({clientEquipment.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEquipment(null);
                        setIsAddEquipmentModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#D31010] hover:text-[#b00d0d] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add new</span>
                    </button>
                  </div>

                  {clientEquipment.length > 0 ? (
                    <div className="space-y-3">
                      {clientEquipment.map((eq) => {
                        const isLaborActive = eq.labor_warranty_exp && new Date(eq.labor_warranty_exp) >= new Date();
                        return (
                          <div
                            key={eq._id}
                            className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {eq.name}
                                </h4>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  Model: {eq.model_number} • Serial: {eq.serial_number || "N/A"}
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                isLaborActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}>
                                {isLaborActive ? "Warranty Active" : "Expired"}
                              </span>
                            </div>

                            {eq.location_in_property && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{eq.location_in_property}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                              <button
                                type="button"
                                onClick={() => setHistoryModalEquipment(eq)}
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Wrench className="w-3 h-3" />
                                <span>History ({eq.history?.length || 0})</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEquipment(eq);
                                  setIsAddEquipmentModalOpen(true);
                                }}
                                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400 max-w-[220px]">
                        No equipment registered for this client.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEquipment(null);
                          setIsAddEquipmentModalOpen(true);
                        }}
                        className="px-4 py-1.5 bg-[#D31010] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        + Add Equipment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <AddAdditionalContactModal
            isOpen={isAddContactModalOpen}
            onClose={() => setIsAddContactModalOpen(false)}
            onAdded={handleContactAdded}
          />

          <AddEquipmentModal
            isOpen={isAddEquipmentModalOpen}
            initialData={editingEquipment}
            clientContext={{ name: clientName, phone, email, address }}
            onClose={() => {
              setIsAddEquipmentModalOpen(false);
              setEditingEquipment(null);
            }}
            onSaved={async () => {
              try {
                const res = await Api("GET", `api/equipment?client_name=${encodeURIComponent(clientName)}`);
                setClientEquipment(Array.isArray(res?.data) ? res.data : []);
              } catch (e) {}
            }}
          />

          <EquipmentHistoryModal
            isOpen={Boolean(historyModalEquipment)}
            equipment={historyModalEquipment}
            onClose={() => setHistoryModalEquipment(null)}
            onHistoryUpdated={async () => {
              try {
                const res = await Api("GET", `api/equipment?client_name=${encodeURIComponent(clientName)}`);
                setClientEquipment(Array.isArray(res?.data) ? res.data : []);
              } catch (e) {}
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
