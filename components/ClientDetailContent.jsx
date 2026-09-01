import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  UserCheck,
  DollarSign,
  Briefcase,
  FileText,
  MapPin,
  CheckSquare,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Receipt,
  CreditCard,
  Building,
  User,
  Clock,
  Send,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import EditClientModal from "./EditClientModal";
import ConfirmationModal from "./ConfirmationModal";
import AddAdditionalContactModal from "./AddAdditionalContactModal";

export default function ClientDetailContent({ clientId }) {
  const router = useRouter();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddressesOpen, setIsAddressesOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(true);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContactData, setEditingContactData] = useState(null);
  const [activeContactMenuId, setActiveContactMenuId] = useState(null);

  const [showTagPopover, setShowTagPopover] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [isCreatingTagView, setIsCreatingTagView] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#2563EB");

  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const tagColorOptions = [
    "#2563EB",
    "#1E3A8A",
    "#3B82F6",
    "#DC2626",
    "#E11D48",
    "#F97316",
    "#EAB308",
    "#D97706",
    "#16A34A",
    "#15803D",
    "#9333EA",
    "#C026D3",
    "#475569",
  ];

  const [availableTagsList, setAvailableTagsList] = useState([
    { name: "VIP Client", color: "#2563EB" },
    { name: "Commercial", color: "#16A34A" },
    { name: "High Priority", color: "#DC2626" },
    { name: "Warranty Active", color: "#9333EA" },
  ]);

  const fetchClientFullDetail = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const res = await Api("GET", `api/clients/${clientId}`, null, router);
      if (res && res.data) {
        setClientData(res.data);
      }
    } catch (err) {
      console.error("Error fetching client details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientFullDetail();
  }, [clientId, router]);

  const client = clientData || {};
  const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
  const jobsList = Array.isArray(client.jobs) ? client.jobs : [];
  const leadsList = Array.isArray(client.leads) ? client.leads : [];
  const estimatesList = Array.isArray(client.estimates) ? client.estimates : [];
  const invoicesList = Array.isArray(client.invoices) ? client.invoices : [];
  const paymentsList = Array.isArray(client.payments) ? client.payments : [];
  const addressesList = Array.isArray(client.addressesList) ? client.addressesList : [];
  const contactsList = Array.isArray(client.additional_contacts) ? client.additional_contacts : [];
  const clientTags = Array.isArray(client.tags) ? client.tags : ["VIP Client"];

  const stats = client.stats || {
    totalRevenue: "0.00",
    due: "0.00",
    pastDue: "0.00",
    estimatesCount: estimatesList.length,
    jobsCount: jobsList.length,
    invoicesCount: invoicesList.length,
    paymentsCount: paymentsList.length,
    addressesCount: addressesList.length || 1,
    leadsCount: leadsList.length,
  };

  const filteredJobs = useMemo(() => {
    return jobsList.filter((j) => {
      const matchSearch = searchQuery
        ? (j.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (j.address?.street || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (j.status || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [jobsList, searchQuery]);

  const filteredLeads = useMemo(() => {
    return leadsList.filter((l) => {
      const matchSearch = searchQuery
        ? (l.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.status || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [leadsList, searchQuery]);

  const filteredEstimates = useMemo(() => {
    return estimatesList.filter((e) => {
      const matchSearch = searchQuery
        ? (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.status || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [estimatesList, searchQuery]);

  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((i) => {
      const matchSearch = searchQuery
        ? (i.invoice_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.status || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [invoicesList, searchQuery]);

  const filteredPayments = useMemo(() => {
    return paymentsList.filter((p) => {
      const matchSearch = searchQuery
        ? (p.method || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.transaction_id || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [paymentsList, searchQuery]);

  const confirmDeleteClient = async () => {
    setIsDeleting(true);
    try {
      const targetId = client._id || clientId;
      if (targetId) {
        await Api("DELETE", `api/clients/${targetId}`, null, router);
      }
      toast.success("Client deleted successfully");
      setIsDeleteModalOpen(false);
      router.push("/clients");
    } catch (err) {
      toast.error("Error deleting client");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApplyTag = async (tagName) => {
    if (!clientTags.includes(tagName)) {
      const updated = [...clientTags, tagName];
      try {
        await Api("PUT", `api/clients/${client._id || clientId}`, { tags: updated });
        setClientData((prev) => ({ ...prev, tags: updated }));
        toast.success(`Tag "${tagName}" added!`);
      } catch (e) {}
    }
    setShowTagPopover(false);
  };

  const handleRemoveTag = async (tagName, e) => {
    e.stopPropagation();
    const updated = clientTags.filter((t) => t !== tagName);
    try {
      await Api("PUT", `api/clients/${client._id || clientId}`, { tags: updated });
      setClientData((prev) => ({ ...prev, tags: updated }));
      toast.success("Tag removed!");
    } catch (e) {}
  };

  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;
    const tagObj = { name: newTagName.trim(), color: newTagColor };
    setAvailableTagsList((prev) => [tagObj, ...prev]);
    handleApplyTag(tagObj.name);
    setNewTagName("");
    setIsCreatingTagView(false);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatMessage;
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatMessage("");
    toast.success("Message sent to client!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
        INVOICE # JOBS # LEADS # CLIENTS # NEW LEAD # <span className="text-slate-800 dark:text-slate-200 font-bold">CLIENT</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/clients")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-3 relative">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {clientName}
              </h1>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showOptionsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit client info</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsDropdown(false);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-2.5 cursor-pointer text-[#D31010]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#D31010]" />
                        <span>Delete client</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {client.company_name && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {client.company_name}
              </p>
            )}

            <div className="pt-1.5">
              <a
                href="https://quickbooks.intuit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span className="w-4 h-4 rounded-md bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center">qb</span>
                <span>View in QuickBooks</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAST DUE</span>
            <span className="text-xl sm:text-2xl font-black text-[#D31010]">
              ${stats.pastDue}
            </span>
          </div>

          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">DUE</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              ${stats.due}
            </span>
          </div>

          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              ${stats.totalRevenue}
            </span>
          </div>

          <div className="text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESTIMATES</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              {stats.estimatesCount}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-red-500/20 transition-all duration-200 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create new</span>
            </button>

            <AnimatePresence>
              {showCreateDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
                >
                  {[
                    { label: "Job", icon: Briefcase, path: `/jobs?create=true&client_id=${client._id || clientId}` },
                    { label: "Lead", icon: UserCheck, path: `/leads?create=true&client_id=${client._id || clientId}` },
                    { label: "Estimate", icon: DollarSign, path: `/estimates?create=true&client_id=${client._id || clientId}` },
                    { label: "Invoice", icon: FileText, path: `/invoices?create=true&client_id=${client._id || clientId}` },
                    { label: "Message", icon: MessageSquare, action: () => setIsChatDrawerOpen(true) },
                    { label: "Contact", icon: User, action: () => { setEditingContactData(null); setContactModalOpen(true); } },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setShowCreateDropdown(false);
                          if (item.action) item.action();
                          else if (item.path) router.push(item.path);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CONTACT
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {client.phone || "—"}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${client.phone || ""}`}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Call Client"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsChatDrawerOpen(true)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Open Messages"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {client.secondary_phone && (
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {client.secondary_phone}
                </div>
              )}

              <div>
                <a
                  href={`mailto:${client.email || ""}`}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#D31010] truncate block"
                >
                  {client.email || "—"}
                </a>
              </div>

              <div className="pt-1 space-y-2 relative">
                <div className="flex flex-wrap gap-1.5">
                  {clientTags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-md flex items-center gap-1.5"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(t, e)}
                        className="hover:opacity-75 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowTagPopover(!showTagPopover)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>add tag</span>
                  </button>

                  <AnimatePresence>
                    {showTagPopover && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100"
                      >
                        {!isCreatingTagView ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Available tags ({availableTagsList.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsCreatingTagView(true)}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Create new</span>
                              </button>
                            </div>

                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search tags"
                                value={tagSearchTerm}
                                onChange={(e) => setTagSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                              />
                            </div>

                            <div className="max-h-36 overflow-y-auto space-y-1.5 py-1">
                              {availableTagsList
                                .filter((t) => t.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))
                                .map((tag) => (
                                  <button
                                    key={tag.name}
                                    type="button"
                                    onClick={() => handleApplyTag(tag.name)}
                                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                      <span>{tag.name}</span>
                                    </span>
                                    {clientTags.includes(tag.name) && (
                                      <Check className="w-3.5 h-3.5 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsCreatingTagView(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Create new tag
                              </span>
                            </div>

                            <input
                              type="text"
                              placeholder="Enter tag name"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                            />

                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Choose color</span>
                              <div className="grid grid-cols-6 gap-2">
                                {tagColorOptions.map((clr) => (
                                  <button
                                    key={clr}
                                    type="button"
                                    onClick={() => setNewTagColor(clr)}
                                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                                      newTagColor === clr ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : ""
                                    }`}
                                    style={{ backgroundColor: clr }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => setIsCreatingTagView(false)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleCreateNewTag}
                                className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAddressesOpen(!isAddressesOpen)}
              className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isAddressesOpen ? "rotate-90" : ""}`} />
                <span>Addresses ({addressesList.length})</span>
              </div>
            </button>
            {isAddressesOpen && (
              <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                {addressesList.length > 0 ? (
                  addressesList.map((addr, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                          {addr.label || "Address"}
                        </span>
                        {addr.is_primary && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {`${addr.street || ""} ${addr.unit ? `, Unit ${addr.unit}` : ""}, ${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""}`.trim() || "Address not provided"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No address logged yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="w-full p-4 flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => setIsContactsOpen(!isContactsOpen)}
                className="flex items-center gap-2 hover:text-[#D31010] cursor-pointer"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isContactsOpen ? "rotate-90" : ""}`} />
                <span>Additional contacts ({contactsList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingContactData(null);
                  setContactModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-[#D31010] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                title="Add Additional Contact"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {isContactsOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                {contactsList.length > 0 ? (
                  contactsList.map((contact, idx) => {
                    const cName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || contact.name || "Contact";
                    const isMenuOpen = activeContactMenuId === (contact._id || idx);

                    return (
                      <div
                        key={contact._id || idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 relative group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {cName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveContactMenuId(isMenuOpen ? null : (contact._id || idx))}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-2 top-8 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveContactMenuId(null);
                                    setEditingContactData(contact);
                                    setContactModalOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3 text-slate-400" />
                                  <span>Edit</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold mb-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}

                        {contact.email && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate mb-0.5">
                            {contact.email}
                          </div>
                        )}

                        {contact.role && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <User className="w-3 h-3" />
                            <span>{contact.role}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-xs py-1">No additional contacts yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
              className="w-full p-4 text-left flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isPaymentsOpen ? "rotate-90" : ""}`} />
                <span>Payment methods ({client.payment_methods?.length || 0})</span>
              </div>
            </button>
            {isPaymentsOpen && (
              <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p>No saved payment cards or bank accounts on file.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold pb-px">
            {[
              { id: "jobs", label: `Jobs`, count: jobsList.length },
              { id: "custom_fields", label: "Custom fields", count: null },
              { id: "estimates", label: `Estimates`, count: estimatesList.length },
              { id: "invoices", label: `Invoices`, count: invoicesList.length },
              { id: "payments", label: `Payments`, count: paymentsList.length },
              { id: "addresses", label: `Addresses`, count: addressesList.length },
              { id: "calls", label: "Calls", count: null },
              { id: "leads", label: `Leads`, count: leadsList.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "border-[#D31010] text-slate-900 dark:text-white font-black"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-red-50 text-[#D31010] dark:bg-red-950/60 dark:text-red-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shadow-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            {activeTab === "jobs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Id</th>
                      <th className="py-3 px-4">Job Name</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">Zipcode</th>
                      <th className="py-3 px-4">Job Date</th>
                      <th className="py-3 px-4">Job Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.slice(0, rowsPerPage).map((job, idx) => {
                        const shortId = job._id ? String(job._id).slice(-4).toUpperCase() : String(idx + 1000);
                        const addr = job.address || {};
                        const dateStr = job.schedule?.start_date
                          ? new Date(job.schedule.start_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                          : "Unscheduled";

                        return (
                          <tr
                            key={job._id || idx}
                            onClick={() => router.push(`/jobs/${job._id}`)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{shortId}</td>
                            <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400 hover:underline">{job.title || "Job"}</td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{job.client_name || clientName}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{addr.street || "Oakville"}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{addr.city || "Oakville"}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{addr.region || "ON"}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{addr.postal_code || "L6H 2B4"}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{dateStr}</td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{job.job_type || "Service"}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                {job.status || "Submitted"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                              ${Number(job.total_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400 text-xs font-semibold">
                          No Records Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "custom_fields" && (
              <div className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Client Custom Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Account Number</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {client.custom_fields?.account_number || `ACC-${String(client._id || "9021").slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Preferred Technician</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {client.custom_fields?.preferred_tech || "PIXL TECHNICIAN"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "estimates" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Estimate #</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {filteredEstimates.length > 0 ? (
                      filteredEstimates.slice(0, rowsPerPage).map((est, idx) => (
                        <tr key={est._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">#{est.estimate_number || String(idx + 101)}</td>
                          <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400 hover:underline">{est.title || "Estimate for Service"}</td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{new Date(est.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">${Number(est.total_amount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                              {est.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-semibold">
                          No Estimates Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Invoice Name</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Amount Due</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.slice(0, rowsPerPage).map((inv, idx) => (
                        <tr
                          key={inv._id || idx}
                          onClick={() => router.push(`/invoices/${inv._id}`)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-red-600 dark:text-red-400">#{inv.invoice_number || String(idx + 880)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inv.invoice_name || "Standard Invoice"}</td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{new Date(inv.created_date || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">${Number(inv.subtotal || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">${Number(inv.total_amount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">${Number(inv.amount_due !== undefined ? inv.amount_due : inv.total_amount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {inv.status || "Due"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-semibold">
                          No Invoices Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Payment #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Invoice #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.slice(0, rowsPerPage).map((pay, idx) => (
                        <tr key={pay.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">#{String(idx + 1).padStart(4, "0")}</td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{new Date(pay.date || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">${Number(pay.amount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{pay.method || "Credit Card"}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{pay.transaction_id || "TXN-001"}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">#{pay.invoice_number || "880"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-semibold">
                          No Payments Recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered Service Addresses</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addressesList.map((addr, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D31010]" />
                          <span>{addr.label || `Location ${idx + 1}`}</span>
                        </span>
                        {addr.is_primary && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {`${addr.street || ""} ${addr.unit ? `, Unit ${addr.unit}` : ""}, ${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""}`.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "calls" && (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Call Logs & Messaging</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click below to open two-way client chat drawer with quick reply templates.
                </p>
                <button
                  type="button"
                  onClick={() => setIsChatDrawerOpen(true)}
                  className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Open Messages Drawer
                </button>
              </div>
            )}

            {activeTab === "leads" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Lead #</th>
                      <th className="py-3 px-4">Lead Name</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Job Type</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.slice(0, rowsPerPage).map((lead, idx) => (
                        <tr
                          key={lead._id || idx}
                          onClick={() => router.push(`/leads`)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">#{String(lead._id || idx + 1).slice(-4).toUpperCase()}</td>
                          <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400 hover:underline">{lead.title || "New Lead"}</td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{new Date(lead.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{lead.job_type || "General Inquiry"}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              {lead.status || "New"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-semibold">
                          No Leads Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isChatDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full text-slate-800 dark:text-slate-100"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChatDrawerOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {clientName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${client.phone || ""}`}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsChatDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-80">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">No messages found</span>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs font-semibold ${
                          msg.sender === "me"
                            ? "bg-[#D31010] text-white rounded-br-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {["Reschedule", "Price inquiry", "Scheduling inquiry", "More replies"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-slate-50 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="p-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white rounded-xl shadow-md shadow-red-500/20 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddAdditionalContactModal
        isOpen={contactModalOpen}
        clientId={client._id || clientId}
        initialData={editingContactData}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContactData(null);
        }}
        onSaved={() => {
          fetchClientFullDetail();
        }}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        client={client}
        onClose={() => setIsEditModalOpen(false)}
        onClientUpdated={() => {
          fetchClientFullDetail();
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Client"
        message={`Are you sure you want to delete ${clientName}? All related records will be archived.`}
        confirmText="Delete"
        confirmButtonClass="bg-[#D31010] hover:bg-[#b00d0d]"
        isLoading={isDeleting}
        onConfirm={confirmDeleteClient}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
